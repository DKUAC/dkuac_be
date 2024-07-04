import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from './entities/user.entity';
import { ActivityModel } from 'src/activity/entities/acitivity.entity';

@Module({
  exports: [UserService],
  imports: [TypeOrmModule.forFeature([UserModel, ActivityModel])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
