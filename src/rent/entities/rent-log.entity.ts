import { PickType } from '@nestjs/mapped-types';
import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';
import { RentModel } from './rent.entity';

@Entity({
  name: 'rent_logs',
})
export class RentLogModel extends BaseModel {
  @Column()
  size: number;

  @Column()
  rent_date: Date;

  @Column()
  rent_student_number: number;
}
