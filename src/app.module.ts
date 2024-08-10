import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
import { RentModule } from './rent/rent.module';
import { ActivityModule } from './activity/activity.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PUBLIC_FOLDER_PATH } from './common/const/path.const';
import { SuggestionModule } from './suggestion/suggestion.module';
import { ScheduleModule } from './schedule/schedule.module';
import { LogInterceptor } from './common/interceptors/log.interceptor';
import { CommentModule } from './activity/comment/comment.module';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { typeOrmModuleOptions } from './configs/db.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    ThrottlerModule.forRoot([
      {
        ttl: 1000,
        limit: 10,
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
    CommentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LogInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
