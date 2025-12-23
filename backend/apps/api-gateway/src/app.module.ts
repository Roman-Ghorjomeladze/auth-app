import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { AuthModule } from './app/auth/auth.module';
import { UserModule } from './app/user/user.module';
import { RmqModule } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/api-gateway/.env',
    }),
    RmqModule,
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
