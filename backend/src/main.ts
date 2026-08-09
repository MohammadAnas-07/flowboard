import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Render terminates TLS at its own proxy and forwards the caller's address
  // in X-Forwarded-For. Without this, Express reports the proxy's IP as
  // req.ip for every request, so the per-IP rate limiter on /api/auth/guest
  // would treat all traffic as one client and lock everyone out together.
  // '1' = trust exactly one hop (Render's proxy), so a client can't spoof
  // its way past the limiter by sending its own X-Forwarded-For.
  app.set('trust proxy', 1);

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? 'http://localhost:3000',
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // '/' and '/health' stay unprefixed so the existing Render health check
  // (configured as /health in render.yaml) keeps working unchanged.
  app.setGlobalPrefix('api', { exclude: ['/', 'health'] });

  await app.listen(process.env.PORT ?? 3000);
}

// void: bootstrap() is the top-level entry point, there's nothing to await it.
// Marking it explicitly satisfies no-floating-promises rather than silently
// dropping the rejection.
void bootstrap();
