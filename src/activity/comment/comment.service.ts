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

  async putComment(commentId: number, userId: number, dto: UpdateCommentDto) {
    const { content } = dto;

    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
      },
      relations: ['Author'],
    });
    if (!comment) {
      throw new BadRequestException('존재하지 않는 댓글입니다.');
    }

    if (comment.Author.id !== userId) {
      throw new BadRequestException('작성자만 수정할 수 있습니다.');
    }

    await this.commentRepository.save({
      ...comment,
      content,
    });

    return {
      message: '댓글이 수정되었습니다.',
    };
  }

  async deleteComment(commentId: number, userId: number) {
    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
      },
      relations: ['Author'],
    });

    if (!comment) {
      throw new BadRequestException('존재하지 않는 댓글입니다.');
    }

    if (comment.Author.id !== userId) {
      throw new BadRequestException('작성자만 삭제할 수 있습니다.');
    }

    await this.commentRepository.delete({
      id: commentId,
    });

    return {
      message: '댓글이 삭제되었습니다.',
    };
  }
}
