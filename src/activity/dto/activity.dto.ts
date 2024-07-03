import { PickType } from '@nestjs/mapped-types';
import { ActivityModel } from '../entities/acitivity.entity';
import { ApiProperty } from '@nestjs/swagger';

export class PostActivityDto extends PickType(ActivityModel, [
  'content',
  'date',
]) {
  @ApiProperty({
    description: '활동 내용',
    default: '외벽 활동',
  })
  content: string;

  @ApiProperty({
    description: '활동 날짜',
    default: '2024-07-04',
  })
  date: Date;
}
