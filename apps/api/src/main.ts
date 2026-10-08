import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({origin:process.env.FRONTEND_ORIGIN || 'http://localhost:3000'});
  app.useGlobalPipes(new ValidationPipe({transform:true,whitelist:true,forbidNonWhitelisted:true,stopAtFirstError:false}));
  await app.listen(Number(process.env.PORT || 3001));
}
bootstrap();
