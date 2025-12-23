import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';

import { UpdateProfileDto } from '@app/common/dto/user/update-profile.dto';
import { UpsertGoogleUserDto } from './dto/upsert-google-user.dto';
import { AppLogger } from '../common/app-logger.service';
import { MetaPayload } from '../common/trace.types';
import { UserService } from './user.service';
import { RMQ_PATTERN } from '@app/common';

@Controller()
export class UserController {
  constructor(
    private readonly users: UserService,
    private readonly logger: AppLogger,
  ) {}

  // RPC: get profile
  @MessagePattern(RMQ_PATTERN.USER_PROFILE_GET)
  async getProfile(@Payload() data: { userId: string; meta: MetaPayload }) {
    this.logger.setTraceId(data.meta.traceId);
    return this.users.getProfile(data.userId);
  }

  // RPC: update profile
  @MessagePattern(RMQ_PATTERN.USER_PROFILE_UPDATE)
  async updateProfile(
    @Payload()
    data: {
      userId: string;
      dto: UpdateProfileDto;
      meta: MetaPayload;
    },
  ) {
    this.logger.setTraceId(data.meta.traceId);
    const updated = await this.users.updateProfile(data.userId, data.dto);
    return updated;
  }

  // Example pub/sub consumer (optional): listen to profile updated events
  @EventPattern(RMQ_PATTERN.USER_PROFILE_UPDATED_EVT)
  async onProfileUpdated() {
    await Promise.resolve();
  }

  @MessagePattern(RMQ_PATTERN.USER_UPSERT_GOOGLE)
  async upsertGoogleUser(
    @Payload() data: { dto: UpsertGoogleUserDto; meta: MetaPayload },
  ): Promise<{ id: string; email: string }> {
    this.logger.setTraceId(data.meta.traceId);
    const user = await this.users.upsertFromGoogle(data.dto);

    return {
      id: user.id,
      email: user.email,
    };
  }
}
