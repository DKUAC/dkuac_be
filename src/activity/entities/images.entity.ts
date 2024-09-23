import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ActivityModel } from './activity.entity';

@Entity({
  name: 'images',
})
export class ImageModel extends BaseModel {
  @Column()
  imageUrl: string;

  @ManyToOne(() => ActivityModel, (activity) => activity.images, {
    onDelete: 'CASCADE',
  })
  Activity: ActivityModel;
}
