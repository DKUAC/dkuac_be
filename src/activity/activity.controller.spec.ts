import { Test, TestingModule } from '@nestjs/testing';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('ActivityController', () => {
  let controller: ActivityController;
  let activityService: ActivityService;
  let activityId: number;
  let mockRequest: {
    user: {
      sub: number;
    };
  };
  let mockPromiesReturn: Promise<any>;
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
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [
        {
          provide: ActivityService,
          useValue: {
            getActivityBySemseter: jest.fn(() => mockReturn),
            postActivity: jest.fn(),
            getActivityById: jest.fn((activityId: number) => mockReturn),
            updateActivity: jest.fn(),
            deleteActivity: jest.fn(
              (userId: number, activityId: number) => mockReturn,
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
    // WHEN
    const result = await controller.getActivityBySemseter();
    // THEN
    expect(activityService.getActivityBySemseter).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockReturn);
  });

  test('특정 활동 게시글을 가져오는 컨트롤러 테스트', async () => {
    // GIVEN
    // WHEN
    const result = await controller.getActivityById(activityId);
    // THEN
    expect(activityService.getActivityById).toHaveBeenCalledWith(1);
    expect(activityService.getActivityById).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockReturn);
  });

  test('활동 글 삭제 컨트롤러 테스트', async () => {
    // GIVEN
    // WHEN
    const result = await controller.deleteActivity(mockRequest, activityId);
    // THEN
    expect(activityService.deleteActivity).toHaveBeenCalledWith(1, 1);
    expect(activityService.deleteActivity).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockReturn);
  });
});
