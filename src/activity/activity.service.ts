import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityModel } from './entities/acitivity.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { PostActivityDto } from './dto/activity.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityModel)
    private readonly activityRepository: Repository<ActivityModel>,
    private readonly userService: UserService,
  ) {}

  async getAcitivityBySemseter() {
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
    const acitivity = await this.activityRepository.findOne({
      where: {
        id,
      },
    });

    if (!acitivity) {
      throw new BadRequestException('존재하지 않는 글입니다.');
    }

    return acitivity;
  }

  async postAcitivity(userId: number, dto: PostActivityDto, images: string[]) {
    try {
      const user = await this.userService.findUserById(userId);

      if (!user) {
        throw new BadRequestException('존재하지 않는 사용자입니다.');
      }

      if (user.isStaff === false) {
        throw new BadRequestException('임원진만 글을 작성할 수 있습니다.');
      }

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
      throw new BadRequestException('활동을 작성하는데 실패했습니다.');
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
