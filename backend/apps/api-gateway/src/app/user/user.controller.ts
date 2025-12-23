import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import type { Request } from 'express';
import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Inject,
  Req,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';

import { UpdateProfileDto } from '@app/common/dto/user/update-profile.dto';
import { RMQ_PATTERN, RMQ_SERVICE, TRACE_ID_META } from '@app/common';
import { AppLogger } from '../../common/logger/app-logger.service';
import { isRpcError, UserErrorCode } from '@app/common/error';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly logger: AppLogger,
    @Inject(RMQ_SERVICE.USER) private readonly userClient: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request): Promise<unknown> {
    this.logger.setTraceId(req.traceId);
    this.logger.log('Get profile request');
    return firstValueFrom(
      this.userClient.send(RMQ_PATTERN.USER_PROFILE_GET, {
        userId: req.user.userId,
        meta: {
          [TRACE_ID_META]: req.traceId,
        },
      }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @Req() req: Request,
    @Body() dto: UpdateProfileDto,
  ): Promise<unknown> {
    try {
      const updated = await firstValueFrom(
        this.userClient
          .send(RMQ_PATTERN.USER_PROFILE_UPDATE, {
            userId: req.user.userId,
            dto,
            meta: {
              traceId: req.traceId,
            },
          })
          .pipe(
            catchError((err) => {
              if (isRpcError(err)) {
                const { code, message } = err;
                if (code === UserErrorCode.USER_NOT_FOUND) {
                  throw new NotFoundException(message ?? 'User not found');
                }
                if (code === UserErrorCode.USER_DELETED) {
                  throw new BadRequestException(message ?? 'User is deleted');
                }
              }

              throw new InternalServerErrorException('User service error');
            }),
          ),
      );

      // Publish an event as bonus pub/sub (other services can subscribe)
      this.userClient.emit(RMQ_PATTERN.USER_PROFILE_UPDATED_EVT, {
        userId: req.user.userId,
        updatedAt: new Date().toISOString(),
      });

      return updated;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
