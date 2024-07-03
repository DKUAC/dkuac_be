import { IsDate, IsIn, IsNumber, IsString } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { UserModel } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({
  name: 'activities',
})
export class ActivityModel extends BaseModel {
  @IsString()
  @Column()
  content: string;

  @IsNumber()
  @Column()
  year: number;

  @IsIn([1, 2])
  @Column()
  semester: 1 | 2;

  @IsDate()
  @Column()
  date: Date;

  @ManyToOne(() => UserModel, (user) => user.activities)
  User: UserModel;
}
