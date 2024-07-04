import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT || 3000;

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: 'Content-Type,Authorization',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 파라미터 변환
      whitelist: true, // 데코레이터가 없는 속성은 제거
      forbidNonWhitelisted: true, // 데코레이터가 없는 속성이 있을 경우 에러 발생
      transformOptions: {
        enableImplicitConversion: true, // 타입 변환
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
