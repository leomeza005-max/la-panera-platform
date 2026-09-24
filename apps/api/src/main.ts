import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.enableShutdownHooks();
  app.setGlobalPrefix('api/v1');

  const port = Number(process.env.PORT || 3000);

  if (!Number.isInteger(port)) {
    throw new Error('PORT debe ser un número válido');
  }

  await app.listen(port);

  console.log(
    `[API] La Panera ejecutándose en http://localhost:${port}/api/v1`,
  );
}

void bootstrap();