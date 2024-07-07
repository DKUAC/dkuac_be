import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { EditActivityDto, PostActivityDto } from './dto/activity.dto';
import { ActivityModel } from './entities/activity.entity';
import { ACTIVITY_PUBLIC_IMAGE_PATH } from 'src/common/const/path.const';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityModel)
    private readonly activityRepository: Repository<ActivityModel>,
    private readonly userService: UserService,
  ) {}

  async getActivityBySemseter() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const semester = month >= 3 && month <= 8 ? 1 : 2;

    return await this.activityRepository.find({
      where: {
        semester,
      },
    });
  }

  async getActivityById(id: number) {
    const activity = await this.activityRepository.findOne({
      where: {
        id,
      },
    });

    if (!activity) {
      throw new BadRequestException('존재하지 않는 글입니다.');
    }

    return activity;
  }

  async postActivity(userId: number, dto: PostActivityDto, images: string[]) {
    try {
      const user = await this.userService.findUserById(userId);

      if (!user) {
        throw new BadRequestException('존재하지 않는 사용자입니다.');
      }

      // if (user.isStaff === false) {
      //   throw new BadRequestException('임원진만 글을 작성할 수 있습니다.');
      // }

      const activity = new ActivityModel();
      activity.content = dto.content;
      activity.date = dto.date;
      activity.semester =
        dto.date.getMonth() >= 3 && dto.date.getMonth() <= 8 ? 1 : 2;
      activity.year = dto.date.getFullYear();
      activity.images = JSON.stringify(images);
      activity.User = user;

      await this.activityRepository.save(activity);
      return activity;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateActivity(
    userId: number,
    activityId: number,
    dto: EditActivityDto,
    images?: string[],
  ) {
    const { content, date } = dto;
    if (!content && !date && !images) {
      throw new BadRequestException('수정할 내용이 없습니다.');
    }

    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new BadRequestException('존재하지 않는 사용자입니다.');
    }

    // if (user.isStaff === false) {
    //   throw new BadRequestException('임원진만 글을 수정할 수 있습니다.');
    // }

    const activity = await this.activityRepository.findOne({
      where: {
        id: activityId,
      },
    });

    if (!activity) {
      throw new BadRequestException('존재하지 않는 글입니다.');
    }

    try {
      activity.content = content ? content : activity.content;
      if (date) {
        activity.date = dto.date;
        activity.semester =
          dto.date.getMonth() >= 3 && dto.date.getMonth() <= 8 ? 1 : 2;
        activity.year = dto.date.getFullYear();
      }
      if (images.length !== 0) {
        activity.images = JSON.stringify(images);
      } else {
        activity.images = JSON.stringify(activity.images).replaceAll(
          `${ACTIVITY_PUBLIC_IMAGE_PATH}/`,
          '',
        );
        activity.images = activity.images;
      }

      await this.activityRepository.save({
        ...activity,
      });
      return activity;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteActivity(userId: number, activityId: number) {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new BadRequestException('존재하지 않는 사용자입니다.');
    }

    if (user.isStaff === false) {
      throw new BadRequestException('임원진만 글을 삭제할 수 있습니다.');
    }

    const activity = await this.activityRepository.findOne({
      where: {
        id: activityId,
      },
    });

    if (!activity) {
      throw new BadRequestException('존재하지 않는 글입니다.');
    }

    return this.activityRepository.delete({
      id: activityId,
    });
  }
}
