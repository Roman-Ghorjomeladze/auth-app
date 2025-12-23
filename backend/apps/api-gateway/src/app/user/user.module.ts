import { Module } from '@nestjs/common';

import { AppLogger } from '../../common/logger/app-logger.service';
import { RMQ_SERVICE, RmqModule } from '@app/common';
import { UserController } from './user.controller';

@Module({
  imports: [
    RmqModule.register([
      {
        name: RMQ_SERVICE.USER,
        queueConfigKey: 'RMQ_USER_QUEUE',
      },
    ]),
  ],
  controllers: [UserController],
  providers: [AppLogger],
})
export class UserModule {}
