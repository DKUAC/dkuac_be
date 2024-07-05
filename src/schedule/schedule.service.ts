import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ScheduleModel } from './entities/schedule.entity';
import { Repository } from 'typeorm';
import {
  CreateScheduleDto,
  DeleteScheduleDto,
  EditScheduleDto,
} from './dto/schedule.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleModel)
    private readonly scheduleRepository: Repository<ScheduleModel>,
    private readonly userService: UserService,
  ) {}
  async createSchedule(userId: number, createScheduleDto: CreateScheduleDto) {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    if (user.isStaff === false) {
      throw new UnauthorizedException('임원진만 일정을 추가할 수 있습니다.');
    }

    const { content, date, location } = createScheduleDto;
    if (!content || !date || !location) {
      throw new BadRequestException('일정 내용, 날짜, 장소는 필수입니다.');
    }
    try {
      const scheduleDate = new Date(date);
      const year = scheduleDate.getFullYear();
      const month = scheduleDate.getMonth() + 1;
      const day = scheduleDate.getDate();
      const semester = month >= 3 && month <= 8 ? 1 : 2;
      const schedule = this.scheduleRepository.create({
        content,
        date: scheduleDate,
        year,
        month,
        day,
        semester,
        location,
      });
      await this.scheduleRepository.save(schedule);
      return schedule;
    } catch (error) {
      throw new Error(
        '일정을 추가하는 중에 문제가 발생했습니다. 다시 한번 시도해주세요.',
      );
    }
  }

  async getSchedule({ year, month }) {
    const schedules = await this.scheduleRepository.find({
      where: {
        year,
        month,
      },
    });
    return {
      year,
      month,
      schedules,
    };
  }

  async editSchedule(userId: number, editScheduleDto: EditScheduleDto) {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }
    const schedule = await this.scheduleRepository.findOne({
      where: {
        id: editScheduleDto.scheduleId,
      },
    });

    if (!schedule) {
      throw new BadRequestException('일정을 찾을 수 없습니다.');
    }

    if (user.isStaff === false) {
      throw new UnauthorizedException('임원진만 일정을 수정할 수 있습니다.');
    }

    try {
      const newSchedule = {
        ...schedule,
        ...editScheduleDto,
      };
      await this.scheduleRepository.save(newSchedule);
      return newSchedule;
    } catch (error) {
      throw new Error(
        '일정을 수정하는 중에 문제가 발생했습니다. 다시 한번 시도해주세요.',
      );
    }
  }

  async deleteSchedule(userId: number, deleteScheduleDto: DeleteScheduleDto) {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    if (user.isStaff === false) {
      throw new UnauthorizedException('임원진만 일정을 삭제할 수 있습니다.');
    }

    const schedule = await this.scheduleRepository.findOne({
      where: {
        id: deleteScheduleDto.scheduleId,
      },
    });

    if (!schedule) {
      throw new BadRequestException('일정을 찾을 수 없습니다.');
    }

    try {
      await this.scheduleRepository.delete({
        id: deleteScheduleDto.scheduleId,
      });
      return schedule;
    } catch (error) {
      throw new Error(
        '일정을 삭제하는 중에 문제가 발생했습니다. 다시 한번 시도해주세요.',
      );
    }
  }
}
