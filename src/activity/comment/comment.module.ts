import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentModel } from './entities/comment.entity';
import { UserModel } from 'src/user/entities/user.entity';
import { ActivityModel } from '../entities/activity.entity';
import { ActivityModule } from '../activity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentModel, UserModel, ActivityModel]),
    ActivityModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
