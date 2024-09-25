import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { UserService } from 'src/auth/user/user.service';
import { DeleteResult, Repository } from 'typeorm';
import { ActivityModel } from './entities/activity.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EditActivityDto, PostActivityDto } from './dto/activity.dto';
import { UserModel } from 'src/auth/user/entities/user.entity';
import { CommentModel } from './comment/entities/comment.entity';

describe('ActivityService', () => {
  let activityService: ActivityService;
  let userService: UserService;
  let activityRepository: Repository<ActivityModel>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        {
          provide: UserService,
          useValue: {
            findUserById: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ActivityModel),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    activityService = module.get<ActivityService>(ActivityService);
    userService = module.get<UserService>(UserService);
    activityRepository = module.get<Repository<ActivityModel>>(
      getRepositoryToken(ActivityModel),
    );
  });

  it('should be defined', () => {
    expect(activityService).toBeDefined();
  });

  describe('getActivityByYearAndSemseter 테스트', () => {
    describe('year와 semeseter가 둘 다 들어온 경우', () => {
      test('semester가 1 또는 2가 아닌 경우 BadRequestException 반환', async () => {
        // GIVEN
        const year = 2024;
        const semester = 3;

        // WHEN
        // THEN
        await expect(
          activityService.getActivityByYearAndSemseter(year, semester),
        ).rejects.toThrow(BadRequestException);
        await expect(
          activityService.getActivityByYearAndSemseter(year, semester),
        ).rejects.toThrow('semester는 1 또는 2만 가능합니다.');
      });

      test('year에 해당하는 년도, semester에 해당하는 학기 활동게시글 전부 보내주기', async () => {
        // GIVEN
        const year = 2024;
        const semester = 2;
        const activity1 = new ActivityModel();
        const activity2 = new ActivityModel();
        const activity3 = new ActivityModel();
        activity1.year = 2024;
        activity1.semester = 2;
        activity2.year = 2024;
        activity2.semester = 2;
        activity3.year = 2023;
        activity3.semester = 1;
        jest
          .spyOn(activityRepository, 'find')
          .mockResolvedValue([activity1, activity2]);
        // WHEN
        const result = await activityService.getActivityByYearAndSemseter(
          year,
          semester,
        );
        // THEN
        expect(result).toEqual([activity1, activity2]);
      });
    });

    describe('year는 받았지만 semester는 받지 않은 경우', () => {
      test('year에 해당하는 년도의 모든 활동 반환', async () => {
        // GIVEN
        const year = 2024;
        const activity1 = new ActivityModel();
        const activity2 = new ActivityModel();
        activity1.year = 2024;
        activity2.year = 2024;
        jest
          .spyOn(activityRepository, 'find')
          .mockResolvedValue([activity1, activity2]);
        // WHEN
        const result = await activityService.getActivityByYearAndSemseter(year);
        // THEN
        expect(result).toEqual([activity1, activity2]);
      });
    });

    describe('year와 semester 둘 다 받지 않은 경우', () => {
      test('현재 날짜 년도와 학기의 활동을 전부 반환 - 1학기', async () => {
        // GIVEN
        const date = new Date(2024, 0, 2);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const semester = month >= 3 && month <= 8 ? 1 : 2;

        const activity1 = new ActivityModel();
        activity1.year = year;
        activity1.semester = semester;

        jest.spyOn(activityRepository, 'find').mockResolvedValue([activity1]);

        // WHEN
        const result = await activityService.getActivityByYearAndSemseter();
        // THEN
        expect(result).toEqual([activity1]);
      });
    });
  });

  describe('getActivityById 테스트', () => {
    test('id에 해당하는 활동게시글이 존재하지 않은 경우 NotFoundException 반환', async () => {
      // GIVEN
      const id = 1;
      jest.spyOn(activityRepository, 'findOne').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(activityService.getActivityById(id)).rejects.toThrow(
        NotFoundException,
      );
      await expect(activityService.getActivityById(id)).rejects.toThrow(
        '존재하지 않는 글입니다.',
      );
    });

    test('id에 해당하는 활동게시글이 존재하면 해당 활동게시글 반환', async () => {
      // GIVEN
      const id = 1;
      const activity1 = new ActivityModel();
      const activity2 = new ActivityModel();
      activity1.id = id;
      activity2.id = 2;
      jest.spyOn(activityRepository, 'findOne').mockResolvedValue(activity1);
      // WHEN
      const result = await activityService.getActivityById(id);
      // THEN
      expect(result).toEqual(activity1);
    });
  });

  describe('postActivity 테스트', () => {
    test('입력으로 받은 userId에 해당하는 유저가 없는 경우 NotFoundException 에러 발생', async () => {
      // GIVEN
      const userId = 1;
      const dto = new PostActivityDto();
      const images = [];
      jest.spyOn(userService, 'findUserById').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(
        activityService.postActivity(userId, dto, images),
      ).rejects.toThrow(NotFoundException);
      await expect(
        activityService.postActivity(userId, dto, images),
      ).rejects.toThrow('존재하지 않는 사용자입니다.');
    });

    test('유저가 임원진이 아닌 경우 UnauthorizedException 에러 발생', async () => {
      // GIVEN
      const userId = 1;
      const dto = new PostActivityDto();
      const images = [];
      const user = new UserModel();
      user.isStaff = false;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      // WHEN
      // THEN
      await expect(
        activityService.postActivity(userId, dto, images),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        activityService.postActivity(userId, dto, images),
      ).rejects.toThrow('임원진만 글을 작성할 수 있습니다.');
    });

    test('dto에 title, content, date 중 하나라도 없는 경우 BadRequestException 반환', async () => {
      // GIVEN
      const userId = 1;
      const dto = new PostActivityDto();
      const images = [];
      const user = new UserModel();
      user.isStaff = true;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      // WHEN
      // THEN
      await expect(
        activityService.postActivity(userId, dto, images),
      ).rejects.toThrow(BadRequestException);
      await expect(
        activityService.postActivity(userId, dto, images),
      ).rejects.toThrow('활동 제목, 내용, 날짜를 입력해주세요.');
    });

    test('알 수 없는 에러 발생시 BadRequestException 발생', async () => {
      // GIVEN
      const userId = 1;
      const dto = new PostActivityDto();
      const images = [];
      const user = new UserModel();
      user.isStaff = true;
      dto.title = 'title';
      dto.content = 'content';
      dto.date = new Date(2024, 0, 1);
      const activity = new ActivityModel();
      activity.title = dto.title;
      activity.content = dto.content;
      activity.date = dto.date;
      activity.semester =
        dto.date.getMonth() + 1 >= 3 && dto.date.getMonth() + 1 <= 8 ? 1 : 2;
      activity.year = dto.date.getFullYear();
      activity.images = JSON.stringify(images);
      activity.Author = user;

      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(activityRepository, 'create').mockReturnValue(activity);
      jest.spyOn(activityRepository, 'save').mockRejectedValue(new Error());
      // WHEN
      // THEN
      await expect(
        activityService.postActivity(userId, dto, images),
      ).rejects.toThrow(BadRequestException);
    });

    test('활동게시글 생성 성공', async () => {
      // GIVEN
      const userId = 1;
      const dto = new PostActivityDto();
      const images = [];
      const user = new UserModel();
      user.isStaff = true;
      dto.title = 'title';
      dto.content = 'content';
      dto.date = new Date(2024, 0, 1);
      const activity = new ActivityModel();
      activity.title = dto.title;
      activity.content = dto.content;
      activity.date = dto.date;
      activity.semester =
        dto.date.getMonth() + 1 >= 3 && dto.date.getMonth() + 1 <= 8 ? 1 : 2;
      activity.year = dto.date.getFullYear();
      activity.images = JSON.stringify(images);
      activity.Author = user;

      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(activityRepository, 'create').mockReturnValue(activity);
      jest.spyOn(activityRepository, 'save').mockResolvedValue(activity);
      // WHEN
      const result = await activityService.postActivity(userId, dto, images);
      // THEN
      expect(result).toEqual(activity);
    });
  });

  describe('updateActivity 테스트', () => {
    test('인자로 받은 userId에 해당하는 유저가 없는 경우 NotFoundException 반환', async () => {
      // GIVEN
      const userId = 1;
      const activityId = 1;
      const dto = new EditActivityDto();
      const images = [];
      jest.spyOn(userService, 'findUserById').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(
        activityService.updateActivity(userId, activityId, dto, images),
      ).rejects.toThrow(NotFoundException);
      await expect(
        activityService.updateActivity(userId, activityId, dto, images),
      ).rejects.toThrow('존재하지 않는 사용자입니다.');
    });

    test('유저가 임원진이 아닌 경우 UnauthorizedException 반환', async () => {
      // GIVEN
      const userId = 1;
      const activityId = 1;
      const dto = new EditActivityDto();
      const images = [];
      const user = new UserModel();
      user.isStaff = false;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      // WHEN
      // THEN
      await expect(
        activityService.updateActivity(userId, activityId, dto, images),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        activityService.updateActivity(userId, activityId, dto, images),
      ).rejects.toThrow('임원진만 글을 수정할 수 있습니다.');
    });

    test('title, content, date, images가 없는 경우, BadRequestException 반환', async () => {
      // GIVEN
      const userId = 1;
      const activityId = 1;
      const dto = new EditActivityDto();
      const user = new UserModel();
      user.isStaff = true;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      // WHEN
      // THEN
      await expect(
        activityService.updateActivity(userId, activityId, dto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        activityService.updateActivity(userId, activityId, dto),
      ).rejects.toThrow('수정할 내용이 없습니다.');
    });

    test('activityId에 해당하는 활동게시글이 없는 경우, NotFoundException 반환', async () => {
      // GIVEN
      const userId = 1;
      const activityId = 1;
      const dto = new EditActivityDto();
      const user = new UserModel();
      user.isStaff = true;
      dto.content = 'test content';
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(activityRepository, 'findOne').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(
        activityService.updateActivity(userId, activityId, dto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        activityService.updateActivity(userId, activityId, dto),
      ).rejects.toThrow('존재하지 않는 글입니다.');
    });

    test('알 수 없는 에러 발생 시 BadRequestException 반환', async () => {
      // GIVEN
      const userId = 1;
      const activityId = 1;
      const dto = new EditActivityDto();
      const user = new UserModel();
      const images = ['img1.jpg', 'img2.jpg'];
      user.isStaff = true;
      dto.content = 'test content';
      dto.date = new Date(2024, 0, 1);
      const activity = new ActivityModel();

      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(activityRepository, 'findOne').mockResolvedValue(activity);

      activity.date = dto.date;
      activity.content = dto.content;
      activity.images = JSON.stringify(images);
      jest.spyOn(activityRepository, 'save').mockRejectedValue(new Error());
      // WHEN
      // THEN
      await expect(
        activityService.updateActivity(userId, activityId, dto, images),
      ).rejects.toThrow(BadRequestException);
    });

    test('활동 게시글 수정 성공 - images가 있는 경우', async () => {
      // GIVEN
      const userId = 1;
      const activityId = 1;
      const dto = new EditActivityDto();
      const user = new UserModel();
      const images = ['img1.jpg', 'img2.jpg'];
      user.isStaff = true;
      dto.content = 'test content';
      dto.date = new Date(2024, 0, 1);
      const activity = new ActivityModel();

      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(activityRepository, 'findOne').mockResolvedValue(activity);

      activity.date = dto.date;
      activity.content = dto.content;
      activity.images = JSON.stringify(images);
      jest.spyOn(activityRepository, 'save').mockResolvedValue(activity);
      // WHEN

      const result = await activityService.updateActivity(
        userId,
        activityId,
        dto,
        images,
      );
      // THEN
      expect(result).toEqual(activity);
    });

    test('활동 게시글 수정 성공 - images가 없는 경우', async () => {
      // GIVEN
      const userId = 1;
      const activityId = 1;
      const dto = new EditActivityDto();
      const user = new UserModel();
      const images = [];
      user.isStaff = true;
      dto.title = 'new title';
      dto.content = 'new content';
      dto.date = new Date(2024, 0, 1);
      const activity = new ActivityModel();

      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(activityRepository, 'findOne').mockResolvedValue(activity);

      activity.title = dto.title;
      activity.date = dto.date;
      activity.content = dto.content;
      activity.images = JSON.stringify(['originImg1.jpg', 'originImg2.jpg']);
      jest.spyOn(activityRepository, 'save').mockResolvedValue(activity);
      // WHEN

      const result = await activityService.updateActivity(
        userId,
        activityId,
        dto,
        images,
      );
      // THEN
      expect(result).toEqual(activity);
    });
  });

  describe('deleteActivity 테스트', () => {
    test('인자로 받은 userId에 해당하는 유저가 없는 경우 NotFoundException 반환', async () => {
      // GIVEN
      const userId = 1;
      const activityId = 1;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(
        activityService.deleteActivity(userId, activityId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        activityService.deleteActivity(userId, activityId),
      ).rejects.toThrow('존재하지 않는 사용자입니다.');
    });

    test('인자로 받은 userId에 해당하는 유저가 임원진이 아닌 경우 UnauthorizedException 반환', async () => {
      // GIVEN
      const userId = 1;
      const activityId = 1;
      const user = new UserModel();
      user.id = userId;
      user.isStaff = false;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      // WHEN
      // THEN
      await expect(
        activityService.deleteActivity(userId, activityId),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        activityService.deleteActivity(userId, activityId),
      ).rejects.toThrow('임원진만 글을 삭제할 수 있습니다.');
    });

    test('인자로 받은 activityId에 해당하는 활동게시글이 없는 경우 NotFoundException 반환', async () => {
      // GIVEN
      const userId = 1;
      const activityId = 1;
      const user = new UserModel();
      user.id = userId;
      user.isStaff = true;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(activityRepository, 'findOne').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(
        activityService.deleteActivity(userId, activityId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        activityService.deleteActivity(userId, activityId),
      ).rejects.toThrow('존재하지 않는 글입니다.');
    });

    test('활동 게시글 삭제 성공', async () => {
      // GIVEN
      const userId = 1;
      const activityId = 1;
      const user = new UserModel();
      user.id = userId;
      user.isStaff = true;
      const activity = new ActivityModel();
      const deletedActivity = new DeleteResult();
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(activityRepository, 'findOne').mockResolvedValue(activity);
      jest
        .spyOn(activityRepository, 'delete')
        .mockResolvedValue(deletedActivity);
      // WHEN
      const result = await activityService.deleteActivity(userId, activityId);
      // THEN
      expect(result).toEqual(deletedActivity);
    });
  });

  describe('getActivityComments 테스트', () => {
    test('인자로 받은 activityId에 해당하는 활동게시글이 없는 경우 NotFoundException 에러 발생', async () => {
      // GIVEN
      const activityId = 1;
      jest.spyOn(activityRepository, 'findOne').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(
        activityService.getActivityComments(activityId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        activityService.getActivityComments(activityId),
      ).rejects.toThrow('존재하지 않는 글입니다.');
    });

    test('activityId에 해당하는 활동게시글 댓글 반환', async () => {
      // GIVEN
      const activityId = 1;
      const activity = new ActivityModel();
      const comment = new CommentModel();
      activity.Comments = [comment];
      jest.spyOn(activityRepository, 'findOne').mockResolvedValue(activity);
      // WHEN
      const result = await activityService.getActivityComments(activityId);
      // THEN
      expect(result).toEqual([comment]);
    });
  });
});
