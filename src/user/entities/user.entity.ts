import { BaseModel } from 'src/common/entities/base.entity';
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsNumber,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Column, Entity } from 'typeorm';

@Entity({
  name: 'users',
})
export class UserModel extends BaseModel {
  @IsString()
  @Column()
  name: string;

  @Type(() => Number)
  @IsNumber()
  @Column({
    unique: true,
  })
  student_number: number;

  @IsDate()
  @Column()
  birth: Date;

  @IsString()
  @Column()
  phone: string;

  @IsIn(['M', 'F'])
  @Column()
  gender: 'M' | 'F';

  @IsString()
  @Column()
  major: string;

  @IsString()
  @Column()
  password: string;

  @IsBoolean()
  @Column({
    default: false,
  })
  is_staff: boolean = false;

  @IsBoolean()
  @Column({ default: true })
  current_semester_member: boolean = true;

  @IsBoolean()
  @Column({ default: false })
  is_paid: boolean = false;
}
