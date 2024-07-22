import { PickType } from '@nestjs/mapped-types';
import { RentModel } from '../entities/rent.entity';
import { ApiProperty } from '@nestjs/swagger';

export class RentShoeDto extends PickType(RentModel, ['size']) {
  @ApiProperty({
    description: '암벽화 사이즈',
    default: 260,
  })
  size: number;
}

export class ReturnShoeDto extends PickType(RentModel, ['size']) {
  @ApiProperty({
    description: '암벽화 사이즈',
    default: 260,
  })
  size: number;
}
