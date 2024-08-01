import { IsDate, IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { join } from 'path';
import { ACTIVITY_PUBLIC_IMAGE_PATH } from 'src/common/const/path.const';
import { BaseModel } from 'src/common/entities/base.entity';
import { UserModel } from 'src/user/entities/user.entity';
import { AfterLoad, Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { CommentModel } from '../comment/entities/comment.entity';

@Entity({
  name: 'activities',
})
export class ActivityModel extends BaseModel {
  @Column()
  title: string;

  @Column()
  content: string;

  @IsNumber()
  @Column()
  year: number;

  @IsIn([1, 2])
  @Column()
  semester: 1 | 2 | number;

  @IsDate()
  @Column()
  date: Date;

  @Column()
  images: string;

  @ManyToOne(() => UserModel, (user) => user.activities)
  Author: UserModel;

  @OneToMany(() => CommentModel, (comment) => comment.Activity)
  Comments: CommentModel[];

  @AfterLoad()
  setImagePath() {
    if (this.images) {
      const imagesPath = JSON.parse(this.images);
      this.images = imagesPath.map(
        (image) => `/${join(ACTIVITY_PUBLIC_IMAGE_PATH, image)}`,
      );
    }
  }
}
