import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityModel } from './entities/acitivity.entity';
import { UserModel } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityModel, UserModel]), UserModule],
  controllers: [ActivityController],
  providers: [ActivityService],
})
export class ActivityModule {}
