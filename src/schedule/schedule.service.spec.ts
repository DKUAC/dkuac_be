import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';
import { Repository } from 'typeorm';
import { ScheduleModel } from './entities/schedule.entity';
import { UserService } from 'src/user/user.service';

describe('ScheduleService', () => {
  let scheduleService: ScheduleService;
  let repository: Repository<ScheduleModel>;
  let userService: UserService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduleService],
    }).compile();

    scheduleService = module.get<ScheduleService>(ScheduleService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(scheduleService).toBeDefined();
  });

  describe('createScehdule 코드 테스트', () => {
    test('userId', async () => {});
  });
});
