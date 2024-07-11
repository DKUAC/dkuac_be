import { PickType } from '@nestjs/mapped-types';
import { CommentModel } from '../entities/comment.entity';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto extends PickType(CommentModel, ['content']) {
  @IsNotEmpty()
  content: string;
}

export class UpdateCommentDto extends CreateCommentDto {}
