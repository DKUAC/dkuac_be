import { IsNotEmpty, IsString } from 'class-validator';
import { ActivityModel } from 'src/activity/entities/activity.entity';
import { BaseModel } from 'src/common/entities/base.entity';
import { UserModel } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({
  name: 'comments',
})
export class CommentModel extends BaseModel {
  @IsString()
  @IsNotEmpty()
  @Column()
  content: string;

  @ManyToOne(() => ActivityModel, (activity) => activity.Comments)
  Activity: ActivityModel;

  @ManyToOne(() => UserModel, (user) => user.Comments)
  Author: UserModel;
}
