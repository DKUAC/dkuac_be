import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentModel } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { ActivityService } from '../activity.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { UserService } from 'src/auth/user/user.service';

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

  async postComment(activityId: number, sub: number, dto: CreateCommentDto) {
    const { content } = dto;
    const activity = await this.activityService.getActivityById(activityId);

    if (!content) {
      throw new BadRequestException('내용을 입력해주세요.');
    }

    try {
      await this.commentRepository.save({
        content,
        Activity: activity,
        Author: {
          id: sub,
        },
      });
      return {
        message: '댓글이 작성되었습니다.',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async putComment(commentId: number, userId: number, dto: UpdateCommentDto) {
    const { content } = dto;

    if (!content) {
      throw new BadRequestException('내용을 입력해주세요.');
    }

    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
      },
      relations: ['Author'],
    });
    if (!comment) {
      throw new NotFoundException('존재하지 않는 댓글입니다.');
    }

    if (comment.Author.id !== userId) {
      throw new UnauthorizedException('작성자만 수정할 수 있습니다.');
    }

    try {
      await this.commentRepository.save({
        ...comment,
        content,
      });

      return {
        message: '댓글이 수정되었습니다.',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteComment(commentId: number, userId: number) {
    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
      },
      relations: ['Author'],
    });

    if (!comment) {
      throw new NotFoundException('존재하지 않는 댓글입니다.');
    }

    if (comment.Author.id !== userId) {
      throw new UnauthorizedException('작성자만 삭제할 수 있습니다.');
    }

    try {
      await this.commentRepository.delete({
        id: commentId,
      });

      return {
        message: '댓글이 삭제되었습니다.',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
