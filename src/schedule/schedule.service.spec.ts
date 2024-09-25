import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';
import { DeleteResult, Repository } from 'typeorm';
import { ScheduleModel } from './entities/schedule.entity';
import { UserService } from 'src/auth/user/user.service';
import {
  CreateScheduleDto,
  DeleteScheduleDto,
  EditScheduleDto,
} from './dto/schedule.dto';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserModel } from 'src/auth/user/entities/user.entity';

describe('ScheduleService', () => {
  let scheduleService: ScheduleService;
  let scheduleRepository: Repository<ScheduleModel>;
  let userService: UserService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        {
          provide: UserService,
          useValue: {
            findUserById: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ScheduleModel),
          useValue: {
            save: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    scheduleService = module.get<ScheduleService>(ScheduleService);
    userService = module.get<UserService>(UserService);
    scheduleRepository = module.get<Repository<ScheduleModel>>(
      getRepositoryToken(ScheduleModel),
    );
  });

  it('should be defined', () => {
    expect(scheduleService).toBeDefined();
  });

  describe('createScehdule 코드 테스트', () => {
    test('userId에 해당하는 유저가 없으면 NotFoundException을 던집니다.', async () => {
      // GIVEN
      const userId = 1;
      const dto = new CreateScheduleDto();
      dto.content = 'test content';
      dto.title = 'test title';
      const mockSchedule = new ScheduleModel();
      jest.spyOn(scheduleRepository, 'create').mockReturnValue(mockSchedule);
      jest.spyOn(scheduleRepository, 'save').mockResolvedValue(mockSchedule);
      // WHEN
      // THEN
      await expect(scheduleService.createSchedule(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(scheduleService.createSchedule(userId, dto)).rejects.toThrow(
        '사용자를 찾을 수 없습니다.',
      );
    });
    test('스케쥴 생성 시 유저가 staff가 아닌 경우 UnauthorizedException을 던집니다.', async () => {
      // GIVEN
      const userId = 1;
      const dto = new CreateScheduleDto();
      dto.content = 'test content';
      dto.title = 'test title';
      const mockUser = new UserModel();
      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser);
      mockUser.isStaff = false;

      // WHEN
      // THEN
      await expect(scheduleService.createSchedule(userId, dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
    test('스케쥴 생성 dto에 title, content, date 중 하나라도 없으면 BadReqeustException을 던집니다. - title이 없는 경우', async () => {
      // GIVEN
      const userId = 1;
      const dto = new CreateScheduleDto();
      dto.content = 'test content';
      dto.date = new Date();
      const mockSchedule = new ScheduleModel();
      const mockUser = new UserModel();
      mockUser.isStaff = true;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser);
      jest.spyOn(scheduleRepository, 'create').mockReturnValue(mockSchedule);
      jest.spyOn(scheduleRepository, 'save').mockResolvedValue(mockSchedule);
      // WHEN
      // THEN
      await expect(scheduleService.createSchedule(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(scheduleService.createSchedule(userId, dto)).rejects.toThrow(
        '일정 내용, 날짜, 장소는 필수입니다.',
      );
    });

    test('스케쥴 생성 dto에 title, content, date 중 하나라도 없으면 BadReqeustException을 던집니다. - content가 없는 경우', async () => {
      // GIVEN
      const userId = 1;
      const dto = new CreateScheduleDto();
      dto.title = 'test title';
      dto.date = new Date();
      const mockSchedule = new ScheduleModel();
      const mockUser = new UserModel();
      mockUser.isStaff = true;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser);
      jest.spyOn(scheduleRepository, 'create').mockReturnValue(mockSchedule);
      jest.spyOn(scheduleRepository, 'save').mockResolvedValue(mockSchedule);
      // WHEN
      // THEN
      await expect(scheduleService.createSchedule(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(scheduleService.createSchedule(userId, dto)).rejects.toThrow(
        '일정 내용, 날짜, 장소는 필수입니다.',
      );
    });

    test('스케쥴 생성 dto에 title, content, date 중 하나라도 없으면 BadReqeustException을 던집니다. - date가 없는 경우', async () => {
      // GIVEN
      const userId = 1;
      const dto = new CreateScheduleDto();
      dto.title = 'test title';
      dto.content = 'test content';
      const mockSchedule = new ScheduleModel();
      const mockUser = new UserModel();
      mockUser.isStaff = true;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser);
      jest.spyOn(scheduleRepository, 'create').mockReturnValue(mockSchedule);
      jest.spyOn(scheduleRepository, 'save').mockResolvedValue(mockSchedule);
      // WHEN
      // THEN
      await expect(scheduleService.createSchedule(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(scheduleService.createSchedule(userId, dto)).rejects.toThrow(
        '일정 내용, 날짜, 장소는 필수입니다.',
      );
    });

    test('스케쥴 생성 도중 이유모를 에러 발생의 경우 BadRequestException을 던짐', async () => {
      // GIVEN
      const userId = 1;
      const dto = new CreateScheduleDto();
      dto.content = 'test content';
      dto.title = 'test title';
      dto.date = new Date();
      const mockSchedule = new ScheduleModel();
      const mockUser = new UserModel();
      mockUser.isStaff = true;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser);
      jest.spyOn(scheduleRepository, 'create').mockReturnValue(mockSchedule);
      jest
        .spyOn(scheduleRepository, 'save')
        .mockRejectedValue(new Error('Save error'));
      // WHEN
      // THEN

      await expect(scheduleService.createSchedule(userId, dto)).rejects.toThrow(
        BadRequestException,
      );

      await expect(scheduleService.createSchedule(userId, dto)).rejects.toThrow(
        '일정을 추가하는 중에 문제가 발생했습니다. 다시 한번 시도해주세요.',
      );
    });

    test('스케쥴 생성 성공', async () => {
      // GIVEN
      const userId = 1;
      const dto = new CreateScheduleDto();
      dto.content = 'test content';
      dto.title = 'test title';
      dto.date = new Date(2024, 0, 7);
      const mockSchedule = new ScheduleModel();
      const mockUser = new UserModel();
      mockUser.isStaff = true;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser);
      jest.spyOn(scheduleRepository, 'create').mockReturnValue(mockSchedule);
      jest.spyOn(scheduleRepository, 'save').mockResolvedValue(mockSchedule);
      // WHEN
      const result = await scheduleService.createSchedule(userId, dto);
      // THEN
      expect(result).toEqual(mockSchedule);
    });
  });

  describe('getSchedule 테스트', () => {
    test('년도와 달을 받으면 해당 년도, 달에 해당하는 전체 일정을 가져옴.', async () => {
      // GIVEN
      const year = 2024;
      const month = 8;
      const mockSchedule1 = new ScheduleModel();
      const mockSchedule2 = new ScheduleModel();
      const mockReturn = [mockSchedule1, mockSchedule2];
      jest.spyOn(scheduleRepository, 'find').mockResolvedValue(mockReturn);
      // WHEN
      const result = await scheduleService.getSchedule({ year, month });
      // THEN
      expect(result).toEqual({
        month,
        schedules: mockReturn,
        year,
      });
    });
  });

  describe('getDaySchedule 테스트', () => {
    test('날짜를 받았을 때 해당 날짜에 일정이 없는 경우 해당날짜의 스케쥴이 없습니다.를 반환', async () => {
      // GIVEN
      const date = new Date();
      const mockReturn = [];
      jest.spyOn(scheduleRepository, 'find').mockResolvedValue(mockReturn);
      // WHEN
      const result = await scheduleService.getDaySchedule(date);

      // THEN
      expect(result).toBe(`${date}의 스케쥴이 없습니다.`);
    });

    test('날짜를 받았을 때 해당 날짜에 일정이 있는 경우 일정을 전부 클라이언트에게 보내줌.', async () => {
      // GIVEN
      const date = new Date();
      const mockSchedule1 = new ScheduleModel();
      const mockSchedule2 = new ScheduleModel();
      const mockReturn = [mockSchedule1, mockSchedule2];
      jest.spyOn(scheduleRepository, 'find').mockResolvedValue(mockReturn);
      // WHEN
      const result = await scheduleService.getDaySchedule(date);

      // THEN
      expect(result).toEqual(mockReturn);
    });
  });

  describe('editSchedule 테스트', () => {
    test('입력으로 받은 userId에 해당하는 유저가 없는 경우 NotFoundException 반환', async () => {
      // GIVEN
      const userId = 1;
      const dto = new EditScheduleDto();

      // WHEN
      // THEN
      await expect(scheduleService.editSchedule(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(scheduleService.editSchedule(userId, dto)).rejects.toThrow(
        '사용자를 찾을 수 없습니다.',
      );
    });

    test('유저가 임원진이 아닌 경우 UnauthorziedException 반환', async () => {
      // GIVEN
      const userId = 1;
      const dto = new EditScheduleDto();
      const user = new UserModel();
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      // WHEN
      // THEN
      await expect(scheduleService.editSchedule(userId, dto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(scheduleService.editSchedule(userId, dto)).rejects.toThrow(
        '임원진만 일정을 수정할 수 있습니다.',
      );
    });

    test('입력으로 받은 editScheduleDto 속 scheduleId에 해당하는 스케쥴이 없는 경우 NotFoundException 반환', async () => {
      // GIVEN
      const userId = 1;
      const dto = new EditScheduleDto();
      const user = new UserModel();
      user.isStaff = true;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(scheduleRepository, 'findOne').mockResolvedValue(undefined);
      // WHEN

      // THEN
      await expect(scheduleService.editSchedule(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(scheduleService.editSchedule(userId, dto)).rejects.toThrow(
        '일정을 찾을 수 없습니다.',
      );
    });

    test('스케쥴 수정 성공', async () => {
      // GIVEN
      const userId = 1;
      const dto = new EditScheduleDto();
      const user = new UserModel();
      const schedule = new ScheduleModel();
      const mockReturn = {
        ...schedule,
        ...dto,
      };
      user.isStaff = true;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(scheduleRepository, 'findOne').mockResolvedValue(schedule);
      jest.spyOn(scheduleRepository, 'save').mockResolvedValue(mockReturn);
      // WHEN
      const result = await scheduleService.editSchedule(userId, dto);
      // THEN
      expect(result).toEqual(mockReturn);
    });

    test('스케쥴 수정 시 알 수 없는 에러 발생하는 경우 BadRequestException 반환', async () => {
      // GIVEN
      const userId = 1;
      const dto = new EditScheduleDto();
      const user = new UserModel();
      const schedule = new ScheduleModel();
      user.isStaff = true;

      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(scheduleRepository, 'findOne').mockResolvedValue(schedule);
      jest.spyOn(scheduleRepository, 'save').mockRejectedValue(new Error());

      // WHEN
      // THEN
      await expect(scheduleService.editSchedule(userId, dto)).rejects.toThrow(
        '일정을 수정하는 중에 문제가 발생했습니다. 다시 한번 시도해주세요.',
      );
      await expect(scheduleService.editSchedule(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteSchedule 테스트', () => {
    test('입력으로 받은 userId에 해당하는 유저가 없는 경우 NotFoundException 반환', async () => {
      // GIVEN
      const userId = 1;
      const dto = new DeleteScheduleDto();

      // WHEN
      // THEN
      await expect(scheduleService.deleteSchedule(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(scheduleService.deleteSchedule(userId, dto)).rejects.toThrow(
        '사용자를 찾을 수 없습니다.',
      );
    });

    test('유저가 임원진이 아닌 경우 UnauthorziedException 반환', async () => {
      // GIVEN
      const userId = 1;
      const dto = new DeleteScheduleDto();
      const user = new UserModel();
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      // WHEN
      // THEN
      await expect(scheduleService.deleteSchedule(userId, dto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(scheduleService.deleteSchedule(userId, dto)).rejects.toThrow(
        '임원진만 일정을 삭제할 수 있습니다.',
      );
    });

    test('입력으로 받은 deleteScheduleDto 속 scheduleId에 해당하는 스케쥴이 없는 경우 NotFoundException 반환', async () => {
      // GIVEN
      const userId = 1;
      const dto = new DeleteScheduleDto();
      const user = new UserModel();
      user.isStaff = true;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(scheduleRepository, 'findOne').mockResolvedValue(undefined);
      // WHEN
      // THEN
      await expect(scheduleService.deleteSchedule(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(scheduleService.deleteSchedule(userId, dto)).rejects.toThrow(
        '일정을 찾을 수 없습니다.',
      );
    });

    test('스케쥴 삭제 성공', async () => {
      // GIVEN
      const userId = 1;
      const dto = new DeleteScheduleDto();
      dto.scheduleId = 1;
      const user = new UserModel();
      const schedule = new ScheduleModel();
      const mockDelete = new DeleteResult();
      user.isStaff = true;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(scheduleRepository, 'findOne').mockResolvedValue(schedule);
      jest.spyOn(scheduleRepository, 'delete').mockResolvedValue(mockDelete);
      // WHEN
      const result = await scheduleService.deleteSchedule(userId, dto);
      // THEN
      expect(result).toEqual(schedule);
    });

    test('스케쥴 삭제 시 알 수 없는 에러 발생하는 경우 BadRequestException 반환', async () => {
      // GIVEN
      const userId = 1;
      const dto = new DeleteScheduleDto();
      dto.scheduleId = 1;
      const user = new UserModel();
      user.isStaff = true;
      const schedule = new ScheduleModel();
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(scheduleRepository, 'findOne').mockResolvedValue(schedule);
      jest.spyOn(scheduleRepository, 'delete').mockRejectedValue(new Error());
      // WHEN
      // THEN
      await expect(scheduleService.deleteSchedule(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(scheduleService.deleteSchedule(userId, dto)).rejects.toThrow(
        '일정을 삭제하는 중에 문제가 발생했습니다. 다시 한번 시도해주세요.',
      );
    });
  });
});
