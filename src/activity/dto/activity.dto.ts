import { PartialType, PickType } from '@nestjs/mapped-types';
import { ActivityModel } from '../entities/activity.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class PostActivityDto extends PickType(ActivityModel, [
  'content',
  'date',
]) {
  @ApiProperty({
    description: '활동 내용',
    default: '외벽 활동',
  })
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: '활동 날짜',
    default: '2024-07-04',
  })
  date: Date;
}

export class EditActivityDto extends PartialType(ActivityModel) {
  @ApiProperty({
    description: '활동 내용',
    default: '외벽 활동',
  })
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: '활동 날짜',
    default: '2024-07-04',
  })
  @IsOptional()
  date?: Date;
}
