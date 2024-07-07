import { BaseModel } from 'src/common/entities/base.entity';
import { IsBoolean, IsDate, IsIn, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';
import { ActivityModel } from 'src/activity/entities/activity.entity';
import { SuggestionModel } from 'src/suggestion/entities/suggestion.entity';

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
  studentNumber: number;

  @IsDate()
  @Column()
  birth: Date;

  @IsString()
  @Column()
  phone: string;

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
  isStaff: boolean = false;

  @IsBoolean()
  @Column({ default: true })
  currentSemesterMember: boolean = true;

  @IsBoolean()
  @Column({ default: false })
  isPaid: boolean = false;

  @OneToMany(() => ActivityModel, (activity) => activity.User)
  activities: ActivityModel[];

  @OneToMany(() => SuggestionModel, (suggestion) => suggestion.User)
  suggestions: SuggestionModel[];
}
