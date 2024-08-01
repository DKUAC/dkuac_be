import { PartialType, PickType } from '@nestjs/mapped-types';
import { ActivityModel } from '../entities/activity.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PostActivityDto extends PickType(ActivityModel, [
  'title',
  'content',
  'date',
]) {
  @ApiProperty({
    description: '활동 제목',
    default: '외벽 활동',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '활동 내용',
    default: '외벽 활동',
  })
  @IsString()
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
    description: '활동 제목',
    default: '외벽 활동',
  })
  @IsOptional()
  title?: string;

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
