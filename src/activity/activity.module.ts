import { BadRequestException, Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityModel } from './entities/activity.entity';
import { UserModel } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  exports: [ActivityService],
  imports: [
    TypeOrmModule.forFeature([ActivityModel, UserModel]),
    UserModule,
    AwsModule,
    MulterModule.register({
      limits: {
        fileSize: 100000000,
      },
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        const memetype = file.mimetype.split('/');
        if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
          return cb(
            new BadRequestException('jpg/jpeg/png 파일만 업로드 가능합니다.'),
            false,
          );
        }
        return cb(null, true);
      },
      storage: multer.memoryStorage(),
    }),
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
})
export class ActivityModule {}
