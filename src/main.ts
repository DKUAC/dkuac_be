import './instrument';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  let configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT') || 3000;
  const NODE_ENV = configService.get<string>('NODE_ENV');
  const CORS_ORIGIN = configService.get<string>('CORS_ORIGIN');
  const corsOptions = {
    origin: [CORS_ORIGIN, 'http://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
  };

  app.use(cookieParser());
  app.enableCors(corsOptions);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('DKUAC Backend')
    .setDescription('DKUAC 홈페이지 백엔드 API')
    .setVersion('1.0')
    .addTag('dkuac')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha', // API 그룹 정렬 알파벳 순
      opertationSorter: 'alpha', // API 그룹 내 정렬 알파벳 순
    },
  });

  await app.listen(PORT, () => {
    console.log(`Running API in MODE: ${NODE_ENV} on PORT ${PORT}`);
  });
}
bootstrap();
