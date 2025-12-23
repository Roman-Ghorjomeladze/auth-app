import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';

import { GlobalHttpExceptionFilter } from '@app/common/filters/http-exception.filter';
import { TraceMiddleware } from './common/middleware/trace.middleware';
import { AppModule } from './app.module';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get<ConfigService>(ConfigService);

  app.enableCors({
    origin: configService.get('CORS_ORIGIN'),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  // eslint-disable-next-line @typescript-eslint/unbound-method
  app.use(new TraceMiddleware().use);
  await app.listen(configService.get('PORT') || 3001);
}
bootstrap().then().catch(console.error);
