import { PickType } from '@nestjs/mapped-types';
import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { RentModel } from './rent.entity';
import { RentLogModel } from './rent-log.entity';

@Entity({
  name: 'return_logs',
})
export class ReturnLogModel extends BaseModel {
  @Column()
  size: number;

  @Column()
  return_date: Date;

  @Column()
  return_student_number: number;

  @OneToOne(() => RentLogModel, {
    eager: true,
  })
  @JoinColumn()
  rented: RentLogModel;
}
