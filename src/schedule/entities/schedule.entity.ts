import { IsIn, IsString } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({
  name: 'schedules',
})
export class ScheduleModel extends BaseModel {
  @Column()
  content: string;

  @Column()
  year: number;

  @Column()
  month: number;

  @Column()
  day: number;

  @Column()
  date: Date;

  @IsIn([1, 2])
  @Column()
  semester: 1 | 2;

  @IsString()
  @Column()
  location: string;
}
