import { PickType } from '@nestjs/mapped-types';
import { SuggestionModel } from '../entities/suggestion.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SuggestionDto extends PickType(SuggestionModel, ['content']) {
  @ApiProperty({
    description: '건의사항 내역',
    default: '외벽을 더 자주 가면 좋을거같아요!',
  })
  @IsString()
  content: string;
}
