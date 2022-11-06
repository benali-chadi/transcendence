import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { AppModule } from './app.module';
import { Jwt_TFA_Guard } from './common/guards/jwt_2fa.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const reflector = new Reflector();
  app.useGlobalGuards(new Jwt_TFA_Guard(reflector));
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONT_URL,
    methods: ['POST', 'PUT', 'DELETE', 'GET'],
    credentials : true,
  });
  app.useStaticAssets(join(__dirname,'..','static'))
  await app.listen(3000);
}
bootstrap();
