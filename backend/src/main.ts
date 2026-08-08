import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? 'http://localhost:3000',
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  // '/' and '/health' stay unprefixed so the existing Render health check
  // (configured as /health in render.yaml) keeps working unchanged.
  app.setGlobalPrefix('api', { exclude: ['/', 'health'] });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
