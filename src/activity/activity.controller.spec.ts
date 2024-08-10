import { Test, TestingModule } from '@nestjs/testing';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { ActivityModel } from './entities/activity.entity';
import { DeleteResult } from 'typeorm';
import { EditActivityDto, PostActivityDto } from './dto/activity.dto';

describe('ActivityController', () => {
  let controller: ActivityController;
  let activityService: ActivityService;
  let activityId: number;
  let mockRequest: {
    user: {
      sub: number;
    };
  };
  let mockReturnPromise: any;
  let mockReturn: string;

  beforeEach(async () => {
    jest.resetAllMocks();
    mockRequest = {
      user: {
        sub: 1,
      },
    };
    activityId = 1;
    mockReturn = 'mock-return';
    mockReturnPromise = new ActivityModel();
    const mockFile = {
      fieldname: 'file',
      originalname: 'TradeHistory.csv',
      encoding: '7bit',
      mimetype: 'text/csv',
      buffer: Buffer.from(__dirname + '/../../TradeHistory.csv', 'utf8'),
      size: 51828,
    } as Express.Multer.File;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [
        {
          provide: ActivityService,
          useValue: {
            getActivityByYearAndSemseter: jest.fn(() => Promise.resolve()),
            postActivity: jest.fn(
              (userId: number, dto: PostActivityDto, images?: string[]) =>
                Promise.resolve(),
            ),
            getActivityById: jest.fn((activityId: number) => mockReturn),
            updateActivity: jest.fn(
              (
                userId: number,
                activityId: number,
                dto: EditActivityDto,
                images?: string[],
              ) => Promise.resolve(),
            ),
            deleteActivity: jest.fn((userId: number, activityId: number) =>
              Promise.resolve(),
            ),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue((context: ExecutionContext) => true)
      .compile();

    controller = module.get<ActivityController>(ActivityController);
    activityService = module.get<ActivityService>(ActivityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  test('활동게시판에 들어갔을 때 Get 요청 테스트', async () => {
    // GIVEN
    const year = 2024;
    const semester = 1;
    const activity1 = new ActivityModel();
    const activity2 = new ActivityModel();

    jest
      .spyOn(activityService, 'getActivityByYearAndSemseter')
      .mockResolvedValue(Promise.resolve([activity1, activity2]));
    // WHEN
    const result = await controller.getActivityByYearAndSemseter(
      year,
      semester,
    );
    // THEN
    expect(activityService.getActivityByYearAndSemseter).toHaveBeenCalledTimes(
      1,
    );
    expect(result).toEqual([activity1, activity2]);
  });

  describe('활동 등록 post 테스트', () => {
    test('사진을 업로드한 경우', async () => {
      // GIVEN
      const dto = new PostActivityDto();
      const mockReturnPromise = new ActivityModel();
      const mockImageFiles = [
        { filename: 'test1.jpg' },
        { filename: 'test2.jpg' },
      ] as Express.Multer.File[];
      jest
        .spyOn(activityService, 'postActivity')
        .mockResolvedValue(Promise.resolve(mockReturnPromise));

      // WHEN
      const result = await controller.postActivity(
        mockRequest,
        dto,
        mockImageFiles,
      );
      // THEN
      expect(activityService.postActivity).toHaveBeenCalledTimes(1);
      expect(activityService.postActivity).toHaveBeenCalledWith(1, dto, [
        'test1.jpg',
        'test2.jpg',
      ]);
      expect(result).toEqual(mockReturnPromise);
    });

    test('활동 사진을 업로드하지 않은 경우', async () => {
      // GIVEN
      const dto = new PostActivityDto();
      const mockImageFiles = [] as Express.Multer.File[];
      dto.content = '활동 사진 업로드 안함';

      // WHEN
      // THEN
      await expect(
        controller.postActivity(mockRequest, dto, mockImageFiles),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('활동게시글 수정 컨트롤러에 대한 테스트', () => {
    test('사진 파일을 업로드 하지 않은 경우, files가 activityService.updateActivity의 인자에 포함되면 안됨.', async () => {
      // GIVEN
      const dto = new EditActivityDto();
      jest
        .spyOn(activityService, 'updateActivity')
        .mockResolvedValue(Promise.resolve(mockReturnPromise));
      // WHEN
      const result = await controller.updateActivity(
        mockRequest,
        activityId,
        dto,
      );
      // TEST
      expect(activityService.updateActivity).toHaveBeenCalledWith(1, 1, dto);
      expect(result).toEqual(mockReturnPromise);
    });

    test('사진 파일을 업로드 한 경우, files가 activityService.updateActivity의 인자에 포함됨.', async () => {
      // GIVEN
      const dto = new EditActivityDto();
      const mockImageFiles = [
        { filename: 'test1.jpg' },
        { filename: 'test2.jpg' },
      ] as Express.Multer.File[];

      jest
        .spyOn(activityService, 'updateActivity')
        .mockResolvedValue(Promise.resolve(mockReturnPromise));
      // WHEN
      const result = await controller.updateActivity(
        mockRequest,
        activityId,
        dto,
        mockImageFiles,
      );
      // TEST
      expect(activityService.updateActivity).toHaveBeenCalledWith(1, 1, dto, [
        'test1.jpg',
        'test2.jpg',
      ]);
      expect(result).toEqual(mockReturnPromise);
    });
  });

  test('특정 활동 게시글을 가져오는 컨트롤러 테스트', async () => {
    // GIVEN
    jest
      .spyOn(activityService, 'getActivityById')
      .mockResolvedValue(Promise.resolve(mockReturnPromise));
    // WHEN
    const result = await controller.getActivityById(activityId);
    // THEN
    expect(activityService.getActivityById).toHaveBeenCalledWith(1);
    expect(activityService.getActivityById).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockReturnPromise);
  });

  test('활동 글 삭제 컨트롤러 테스트', async () => {
    // GIVEN
    const mockReturnPromise = new DeleteResult();
    jest
      .spyOn(activityService, 'deleteActivity')
      .mockResolvedValue(Promise.resolve(mockReturnPromise));
    // WHEN
    const result = await controller.deleteActivity(mockRequest, activityId);
    // THEN
    expect(result).toEqual(mockReturnPromise);
  });
});
