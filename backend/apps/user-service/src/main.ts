import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';

import { UserServiceModule } from './app.module';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL!],
        queue: process.env.RMQ_USER_QUEUE!,
        queueOptions: { durable: true },
      },
    },
  );

  await app.listen();
}
bootstrap()
  .then()
  .catch((err) => console.error(err));
