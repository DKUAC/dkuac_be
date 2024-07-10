import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  const PORT = process.env.PORT || 3000;

  app.enableCors({
    origin: true, // true -> 모든 url에 개방(개발 환경). 배포시 특정 url만 허용하도록 변경
    credentials: true, // 프론트에서 credentials 설정을 true로!
  });

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
    console.log(`Running API in MODE: ${process.env.NODE_ENV} on PORT ${PORT}`);
  });
}
bootstrap();
