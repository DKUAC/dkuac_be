import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentModel } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { ActivityService } from '../activity.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentModel)
    private readonly commentRepository: Repository<CommentModel>,
    private readonly activityService: ActivityService,
  ) {}

  async getComments(activityId: number) {
    return await this.activityService.getActivityComments(activityId);
  }

  async postComment(activityId: number, userId: number, dto: CreateCommentDto) {
    const { content } = dto;
    const activity = await this.activityService.getActivityById(activityId);
    if (!activity) {
      throw new BadRequestException('존재하지 않는 활동입니다.');
    }

    if (!content) {
      throw new BadRequestException('내용을 입력해주세요.');
    }

    await this.commentRepository.save({
      content,
      Activity: activity,
      Author: {
        id: userId,
      },
    });
    return {
      message: '댓글이 작성되었습니다.',
    };
  }

  async putComment(
    activityId: number,
    commentId: number,
    userId: number,
    dto: UpdateCommentDto,
  ) {}
}
