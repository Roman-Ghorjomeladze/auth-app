import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RmqClientConfig } from './rmq.types';

@Module({})
export class RmqModule {
  static register(clients: RmqClientConfig[]): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ConfigModule, // 👈 makes ConfigService available
        ClientsModule.registerAsync(
          clients.map((client) => ({
            name: client.name,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [config.getOrThrow<string>('RABBITMQ_URL')],
                queue: config.getOrThrow<string>(client.queueConfigKey),
                queueOptions: { durable: true },
              },
            }),
          })),
        ),
      ],
      exports: [ClientsModule],
    };
  }
}
