import { IsDataURI, IsDate, IsNumber } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { UserModel } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity({
  name: 'rents',
})
export class RentModel extends BaseModel {
  @IsNumber()
  @Column()
  size: number;

  @IsDate()
  @Column()
  rent_date: Date;

  @OneToOne(() => UserModel)
  @JoinColumn()
  User: UserModel;
}
