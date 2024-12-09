import { PickType } from '@nestjs/mapped-types';
import { CommentModel } from '../entities/comment.entity';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto extends PickType(CommentModel, ['content']) {
  @ApiProperty({
    description: '댓글 내용',
    default: '좋은 글이네요!',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class UpdateCommentDto extends PickType(CommentModel, ['content']) {
  @ApiProperty({
    description: '댓글 내용',
    default: '수정할 댓글입니다.',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}
