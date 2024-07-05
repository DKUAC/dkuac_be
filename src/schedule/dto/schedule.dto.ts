import { PickType } from '@nestjs/mapped-types';
import { ScheduleModel } from '../entities/schedule.entity';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScheduleDto extends PickType(ScheduleModel, [
  'content',
  'date',
  'location',
]) {
  @ApiProperty({
    description: '일정 내용',
    example: '등산',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: '장소',
    example: '북한산',
  })
  @IsString()
  location: string;

  @ApiProperty({
    description: '날짜',
    example: '2024-07-05',
  })
  @IsDate()
  date: Date;
}

export class GetSheduleDto {
  @ApiProperty({
    description: '년도',
    example: 2024,
  })
  @IsNumber()
  @IsOptional()
  year: number = new Date().getFullYear();

  @ApiProperty({
    description: '월',
    example: 7,
  })
  @IsNumber()
  @IsOptional()
  month: number = new Date().getMonth() + 1;
}

export class EditScheduleDto {
  @ApiProperty({
    description: '일정 ID',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  scheduleId: number;

  @ApiProperty({
    description: '일정 내용',
    example: '등산',
  })
  @IsString()
  @IsOptional()
  content: string;

  @ApiProperty({
    description: '장소',
    example: '북한산',
  })
  @IsString()
  @IsOptional()
  location: string;

  @ApiProperty({
    description: '날짜',
    example: '2024-07-05',
  })
  @IsDate()
  @IsOptional()
  date: Date;
}

export class DeleteScheduleDto {
  @ApiProperty({
    description: '일정 ID',
    example: 1,
  })
  @IsNumber()
  scheduleId: number;
}
