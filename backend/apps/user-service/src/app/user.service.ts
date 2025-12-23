import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { UpdateProfileDto } from '@app/common/dto/user/update-profile.dto';
import { UserErrorCode } from '@app/common/error/errors';
import { AppLogger } from '../common/app-logger.service';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    private logger: AppLogger,
    @InjectRepository(UserEntity) private repo: Repository<UserEntity>,
  ) {}

  async upsertFromGoogle(
    input: {
      googleId: string;
      email: string;
      name?: string;
      avatarUrl?: string;
    },
    traceId?: string,
  ) {
    this.logger.setTraceId(traceId);
    const existing = await this.repo.findOne({
      where: [{ googleId: input.googleId }, { email: input.email }],
    });

    if (existing) {
      this.logger.log(`Merging existing user with google id ${input.googleId}`);
      const merged = this.repo.merge(existing, input);
      return this.repo.save(merged);
    }
    this.logger.log(`Creating new user with google id ${input.googleId}`);
    return this.repo.save(this.repo.create(input));
  }

  async getProfile(userId: string) {
    this.logger.log('Fetching user profile', { userId });
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.error('User not found');
      throw new RpcException({
        code: UserErrorCode.USER_NOT_FOUND,
        message: 'User not found',
      });
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    this.logger.log(`Update profile by usderId ${userId}`);
    const user = await this.getProfile(userId);
    const merged = this.repo.merge(user, dto);
    return this.repo.save(merged);
  }
}
