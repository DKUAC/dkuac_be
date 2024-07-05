import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
import { RentModule } from './rent/rent.module';
import { ActivityModule } from './activity/activity.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PUBLIC_FOLDER_PATH } from './common/const/path.const';
import { SuggestionModule } from './suggestion/suggestion.module';
import { ScheduleModule } from './schedule/schedule.module';

const configService = new ConfigService();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: configService.get('DOCKER_MYSQL_HOST'),
      port: configService.get<number>('DOCKER_MYSQL_PORT'),
      database: configService.get('DOCKER_MYSQL_DATABASE'),
      username: configService.get('DOCKER_MYSQL_USERNAME'),
      password: configService.get('DOCKER_MYSQL_PASSWORD'),
      autoLoadEntities: true,
      synchronize: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 50,
      },
    ]),
    AuthModule,
    CommonModule,
    UserModule,
    EmailModule,
    RentModule,
    ActivityModule,
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_FOLDER_PATH,
      serveRoot: '/public',
    }),
    SuggestionModule,
    ScheduleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
