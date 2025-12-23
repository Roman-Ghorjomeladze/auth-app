import { Controller, Get, Inject, Req, Res, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';

import { RMQ_PATTERN, RMQ_SERVICE } from '@app/common';
import { GoogleUser } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(RMQ_SERVICE.USER)
    private readonly userClient: ClientProxy,
  ) {}

  @Get('login/google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Redirects to Google
  }

  @Get('validate/google')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: Request & { user: GoogleUser },
    @Res() res: Response,
  ): Promise<unknown> {
    const user: { id: string; email: string } = await firstValueFrom(
      this.userClient.send(RMQ_PATTERN.USER_UPSERT_GOOGLE, {
        dto: req.user,
        meta: { traceId: req.traceId },
      }),
    );

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');

    return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
}
