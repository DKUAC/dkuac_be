import { Test, TestingModule } from '@nestjs/testing';
import { RentService } from './rent.service';
import { DataSource, Repository } from 'typeorm';
import { RentModel } from './entities/rent.entity';
import { ShoeModel } from './entities/shoe.entity';
import { UserService } from 'src/user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('RentService', () => {
  let rentService: RentService;
  let rentRepository: Repository<RentModel>;
  let shoeRepository: Repository<ShoeModel>;
  let userService: UserService;
  let dataSources: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RentService,
        {
          provide: UserService,
          useValue: {
            findUserById: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RentModel),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ShoeModel),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(),
          },
        },
      ],
    }).compile();

    rentService = module.get<RentService>(RentService);
    rentRepository = module.get<Repository<RentModel>>(
      getRepositoryToken(RentModel),
    );
    shoeRepository = module.get<Repository<ShoeModel>>(
      getRepositoryToken(ShoeModel),
    );
    userService = module.get<UserService>(UserService);
    dataSources = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(rentService).toBeDefined();
  });

  describe('checkShoeCount 테스트', () => {
    it('사이즈별 암벽화 개수 및 대여 상태 반환', async () => {
      // GIVEN
      jest.spyOn(shoeRepository, 'find').mockResolvedValue([]);
      // WHEN
      const result = await rentService.checkShoeCount();
      // THEN
      expect(result).toEqual([]);
    });
  });

  describe('checkRent 테스트', () => {
    it('대여 정보 반환', async () => {
      // GIVEN
      const rent1 = new RentModel();
      rent1.size = 230;
      rent1.rent_date = new Date('2024-08-01');
      rent1.User = { name: 'test1|1234' } as any;
      const rent2 = new RentModel();
      rent2.size = 240;
      rent2.rent_date = new Date('2024-08-02');
      rent2.User = { name: 'test2|5678' } as any;
      const rents = [rent1, rent2];
      jest.spyOn(rentRepository, 'find').mockResolvedValue(rents);
      // WHEN
      const result = await rentService.checkRent();
      // THEN
      expect(result).toEqual([
        { size: 230, rent_date: new Date('2024-08-01'), name: 'test1' },
        { size: 240, rent_date: new Date('2024-08-02'), name: 'test2' },
      ]);
    });
  });

  describe('rentShoe 테스트', () => {
    test('userId에 해당하는 유저가 없는 경우, NotFoundException 반환', async () => {
      // GIVEN
      jest.spyOn(dataSources, 'createQueryRunner').mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
      } as any);

      const userId = 1;
      const size = 230;

      jest.spyOn(userService, 'findUserById').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(rentService.rentShoe(userId, size)).rejects.toThrow(
        '회원 정보를 찾을 수 없습니다.',
      );
    });
  });
});
