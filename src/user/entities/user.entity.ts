import { BaseModel } from 'src/common/entities/base.entity';
import { Type } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';
import { ActivityModel } from 'src/activity/entities/activity.entity';
import { SuggestionModel } from 'src/suggestion/entities/suggestion.entity';
import { CommentModel } from 'src/activity/comment/entities/comment.entity';

@Entity({
  name: 'users',
})
export class UserModel extends BaseModel {
  @Column()
  name: string;

  @Column()
  email: string;

  @Type(() => Number)
  @Column({
    unique: true,
  })
  studentNumber: number;

  @Column()
  birth: Date;

  @Column()
  phone: string;

  @Column()
  major: string;

  @Column()
  password: string;

  @Column({
    default: false,
  })
  isStaff: boolean = false;

  @Column({ default: true })
  currentSemesterMember: boolean = true;

  @Column({ default: false })
  isPaid: boolean = false;

  @OneToMany(() => ActivityModel, (activity) => activity.Author)
  activities: ActivityModel[];

  @OneToMany(() => SuggestionModel, (suggestion) => suggestion.User)
  suggestions: SuggestionModel[];

  @OneToMany(() => CommentModel, (comment) => comment.Author)
  Comments: CommentModel[];
}
