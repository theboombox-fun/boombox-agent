import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { SerializeBigIntInterceptor } from './common/interceptors/serialize-bigint.interceptor.js';
import "./instrument.js";
import { registerFont } from 'canvas';
import * as path from 'path';
import * as fs from 'fs';
import { ApiKeyGuard } from './common/guards/api-key.guard.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});

  const configService = app.get(ConfigService);

  app.useGlobalGuards(new ApiKeyGuard(configService));

  app.useGlobalInterceptors(new SerializeBigIntInterceptor());

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Api-Key', "x-api-key"],
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  const fontPath = path.join(process.cwd(), 'assets/fonts/InterDisplay-Black.ttf');

  if (fs.existsSync(fontPath)) {
    registerFont(fontPath, { family: 'Inter Display Black' });
  } else {
    console.error('Font file not found:', fontPath);
  }

  const config = new DocumentBuilder()
    .setTitle('Boombox Agent API documentation')
    .setDescription(
      'Boombox Agent API documentation. Includes all endpoints',
    )
    .setVersion('1.0.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory);

  const PORT = configService.get<number>('PORT') || 3000;
  console.log('Server Port: ', PORT);

  await app.listen(PORT);
}

bootstrap()
  .then(() => {
    console.log('Server started');
  })
  .catch(() => {
    console.log('Server not started');
  });