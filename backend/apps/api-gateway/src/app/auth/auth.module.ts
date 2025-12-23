import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';

import { RMQ_SERVICE, RmqModule } from '@app/common';
import { GoogleStrategy } from './google.strategy';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    RmqModule.register([
      {
        name: RMQ_SERVICE.USER,
        queueConfigKey: 'RMQ_USER_QUEUE',
      },
    ]),
    PassportModule.register({ session: false }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        const expirationFromEnv = configService.get<string>(
          'JWT_EXPIRES_IN',
          '7d',
        ) as StringValue;
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: expirationFromEnv || '7d',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, GoogleStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
