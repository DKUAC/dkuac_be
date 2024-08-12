import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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

  async getActivityByYearAndSemseter(year?: number, semester?: number) {
    if (year && semester) {
      if (semester !== 1 && semester !== 2) {
        throw new BadRequestException('semester는 1 또는 2만 가능합니다.');
      }
      const activities = await this.activityRepository.find({
        where: {
          year,
          semester,
        },
      });
      return activities;
    } else if (year && !semester) {
      const activities = await this.activityRepository.find({
        where: {
          year,
        },
      });
      return activities;
    } else if (!year && !semester) {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const semester = month >= 3 && month <= 8 ? 1 : 2;

      const activities = await this.activityRepository.find({
        where: {
          year,
          semester,
        },
      });
      return activities;
    }
  }

  async getActivityById(id: number) {
    const activity = await this.activityRepository.findOne({
      where: {
        id,
      },
      relations: ['Author', 'Comments'],
    });

    if (!activity) {
      throw new NotFoundException('존재하지 않는 글입니다.');
    }

    return activity;
  }

  async postActivity(userId: number, dto: PostActivityDto, images: string[]) {
    const user = await this.userService.findUserById(userId);
    const { title, content, date } = dto;
    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }

    if (user.isStaff === false) {
      throw new UnauthorizedException('임원진만 글을 작성할 수 있습니다.');
    }

    if (!title || !content || !date) {
      throw new BadRequestException('활동 제목, 내용, 날짜를 입력해주세요.');
    }

    try {
      const activity = this.activityRepository.create({
        title,
        content,
        date,
        semester: date.getMonth() + 1 >= 3 && date.getMonth() + 1 <= 8 ? 1 : 2,
        year: date.getFullYear(),
        images: JSON.stringify(images),
        Author: user,
      });

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
    const user = await this.userService.findUserById(userId);

    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }

    if (user.isStaff === false) {
      throw new UnauthorizedException('임원진만 글을 수정할 수 있습니다.');
    }

    const { title, content, date } = dto;

    if (!title && !content && !date && !images) {
      throw new BadRequestException('수정할 내용이 없습니다.');
    }

    const activity = await this.activityRepository.findOne({
      where: {
        id: activityId,
      },
    });

    if (!activity) {
      throw new NotFoundException('존재하지 않는 글입니다.');
    }

    try {
      activity.title = title ? title : activity.title;
      activity.content = content ? content : activity.content;
      if (date) {
        activity.date = dto.date;
        activity.semester =
          dto.date.getMonth() + 1 >= 3 && dto.date.getMonth() + 1 <= 8 ? 1 : 2;
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

      const updatedActivity = await this.activityRepository.save({
        ...activity,
      });
      return updatedActivity;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteActivity(userId: number, activityId: number) {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }

    if (user.isStaff === false) {
      throw new UnauthorizedException('임원진만 글을 삭제할 수 있습니다.');
    }

    const activity = await this.activityRepository.findOne({
      where: {
        id: activityId,
      },
    });

    if (!activity) {
      throw new NotFoundException('존재하지 않는 글입니다.');
    }

    const deletedActivity = await this.activityRepository.delete({
      id: activityId,
    });

    return deletedActivity;
  }

  async getActivityComments(activityId: number) {
    const activity = await this.activityRepository.findOne({
      where: {
        id: activityId,
      },
      relations: ['Comments'],
    });

    if (!activity) {
      throw new NotFoundException('존재하지 않는 글입니다.');
    }

    console.log('in comment service');
    console.log(activity);
    return activity.Comments;
  }
}
