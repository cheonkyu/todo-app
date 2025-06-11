import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');

  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  try {
    await app.listen(port, '0.0.0.0');
    console.log(`Application is running on: http://localhost:${port}`);
  } catch (error) {
    console.error('Failed to start the application:', error);
  }
}
bootstrap(); 