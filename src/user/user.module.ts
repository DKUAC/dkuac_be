import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from './entities/user.entity';
import { ActivityModel } from 'src/activity/entities/acitivity.entity';
import { SuggestionModel } from 'src/suggestion/entities/suggestion.entity';

@Module({
  exports: [UserService],
  imports: [
    TypeOrmModule.forFeature([UserModel, ActivityModel, SuggestionModel]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
