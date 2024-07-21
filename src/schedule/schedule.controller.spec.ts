import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  CreateScheduleDto,
  DeleteScheduleDto,
  EditScheduleDto,
  GetSheduleDto,
} from './dto/schedule.dto';
import { ScheduleModel } from './entities/schedule.entity';

describe('ScheduleController', () => {
  let scheduleController: ScheduleController;
  let scheduleService: ScheduleService;
  let mockRequest: any;
  let mockReturn = new ScheduleModel();

  beforeEach(async () => {
    jest.resetAllMocks();
    mockRequest = {
      user: {
        sub: 1,
      },
    };
    //   let mockReturn = new ScheduleModel(); 여기에 선언하면 왜 테스트 실패?
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [
        {
          provide: ScheduleService,
          useValue: {
            createSchedule: jest.fn((sub, createScheduleDto) =>
              Promise.resolve(new ScheduleModel()),
            ),
            getSchedule: jest.fn(({ year, month }) => {
              return {
                year,
                month,
                schedules: [],
              };
            }),
            editSchedule: jest.fn((userId, editScheduleDto) => {
              return Promise.resolve(mockReturn);
            }),
            deleteSchedule: jest.fn((sub, deleteScheduleDto) =>
              Promise.resolve(mockReturn),
            ),
          },
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({
        canActiate: (context: ExecutionContext) => true,
      })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActiate: (context: ExecutionContext) => true })
      .compile();

    scheduleController = module.get<ScheduleController>(ScheduleController);
    scheduleService = module.get<ScheduleService>(ScheduleService);
  });

  test('스케쥴 생성 컨트롤러 테스트', async () => {
    // GIVEN
    const dto = new CreateScheduleDto();
    const mockReturn = new ScheduleModel();
    // WHEN
    const result = await scheduleController.createSchedule(mockRequest, dto);
    // THEN
    expect(scheduleService.createSchedule).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual(mockReturn);
  });

  test('스케쥴 조회 컨트롤러 테스트', async () => {
    // GIVEN
    const dto = new GetSheduleDto();
    dto.year = 2024;
    dto.month = 7;

    // WHEN
    const result = await scheduleController.getSchedule(dto);
    // THEN
    expect(scheduleService.getSchedule).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      year: 2024,
      month: 7,
      schedules: [],
    });
  });

  test('스케쥴 수정 컨트롤러 테스트', async () => {
    // GIVEN
    const dto = new EditScheduleDto();
    // WHEN
    const result = await scheduleController.editSchedule(mockRequest, dto);

    // THEN
    expect(scheduleService.editSchedule).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual(mockReturn);
  });

  test('스케쥴 삭제 컨트롤러 테스트', async () => {
    // GIVEN
    const dto = new DeleteScheduleDto();
    // WHEN
    const result = await scheduleController.deleteSchedule(mockRequest, dto);
    // THEN
    expect(scheduleService.deleteSchedule).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual(mockReturn);
  });
});
