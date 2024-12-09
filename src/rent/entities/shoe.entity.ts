import { IsNumber } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({
  name: 'shoes',
})
export class ShoeModel extends BaseModel {
  @Column()
  size: number;

  @Column()
  count: number;

  @Column()
  rentable: number;
}
