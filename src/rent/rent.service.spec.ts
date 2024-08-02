import { Test, TestingModule } from '@nestjs/testing';
import { RentService } from './rent.service';
import { DataSource, Repository } from 'typeorm';
import { RentModel } from './entities/rent.entity';
import { ShoeModel } from './entities/shoe.entity';
import { UserService } from 'src/user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserModel } from 'src/user/entities/user.entity';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

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
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ShoeModel),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
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
    test('대여 정보 반환', async () => {
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
        NotFoundException,
      );
      await expect(rentService.rentShoe(userId, size)).rejects.toThrow(
        '회원 정보를 찾을 수 없습니다.',
      );
    });

    test('userId에 해당하는 유저가 회비를 내지 않았거나 지금 학기 회원이 아닌 경우, UnauthorizedException 반환 - 회비 안낸 경우', async () => {
      // GIVEN
      const userId = 1;
      const size = 230;
      const user = new UserModel();
      user.isPaid = false;
      user.currentSemesterMember = true;

      jest.spyOn(dataSources, 'createQueryRunner').mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
      } as any);

      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      // WHEN
      // THEN
      await expect(rentService.rentShoe(userId, size)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(rentService.rentShoe(userId, size)).rejects.toThrow(
        '회원 가입 또는 회비 납부 후 이용 가능합니다.',
      );
    });

    test('userId에 해당하는 유저가 회비를 내지 않았거나 지금 학기 회원이 아닌 경우, UnauthorizedException 반환 - 현재 학기 회원이 아닌 경우', async () => {
      // GIVEN
      const userId = 1;
      const size = 230;
      const user = new UserModel();
      user.isPaid = true;
      user.currentSemesterMember = false;

      jest.spyOn(dataSources, 'createQueryRunner').mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
      } as any);

      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      // WHEN
      // THEN
      await expect(rentService.rentShoe(userId, size)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(rentService.rentShoe(userId, size)).rejects.toThrow(
        '회원 가입 또는 회비 납부 후 이용 가능합니다.',
      );
    });

    test('이미 대여한 기록이 있는 경우 대여 불가, BadRequestExceiption 반환', async () => {
      // GIVEN
      const userId = 1;
      const size = 230;
      const user = new UserModel();
      user.isPaid = true;
      user.currentSemesterMember = true;

      jest.spyOn(dataSources, 'createQueryRunner').mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
      } as any);

      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(rentRepository, 'findOne').mockResolvedValue(new RentModel());
      // WHEN
      // THEN
      await expect(rentService.rentShoe(userId, size)).rejects.toThrow(
        BadRequestException,
      );
      await expect(rentService.rentShoe(userId, size)).rejects.toThrow(
        '1인당 1개의 신발만 대여 가능합니다.',
      );
    });

    test('대여하려는 사이즈의 신발이 없거나 다 대여된 경우, NotFoundException 반환 - 해당 사이즈에 대한 암벽화가 없는 경우', async () => {
      // GIVEN
      const userId = 1;
      const size = 230;
      const user = new UserModel();
      user.isPaid = true;
      user.currentSemesterMember = true;

      jest.spyOn(dataSources, 'createQueryRunner').mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
      } as any);

      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(rentRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(shoeRepository, 'findOne').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(rentService.rentShoe(userId, size)).rejects.toThrow(
        NotFoundException,
      );
      await expect(rentService.rentShoe(userId, size)).rejects.toThrow(
        '해당 사이즈의 신발이 없습니다.',
      );
    });

    test('대여하려는 사이즈의 신발이 없거나 다 대여된 경우, NotFoundException 반환 - 해당 사이즈에 대한 암벽화가 전부 대여된 경우', async () => {
      // GIVEN
      const userId = 1;
      const size = 230;
      const user = new UserModel();
      user.isPaid = true;
      user.currentSemesterMember = true;
      const shoe = new ShoeModel();
      shoe.rentable = 0;
      jest.spyOn(dataSources, 'createQueryRunner').mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
      } as any);

      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(rentRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(shoeRepository, 'findOne').mockResolvedValue(shoe);
      // WHEN
      // THEN
      await expect(rentService.rentShoe(userId, size)).rejects.toThrow(
        NotFoundException,
      );
      await expect(rentService.rentShoe(userId, size)).rejects.toThrow(
        '해당 사이즈의 신발이 없습니다.',
      );
    });

    test('대여 성공 시 "대여완료" 반환', async () => {
      // GIVEN
      const userId = 1;
      const size = 230;
      const user = new UserModel();
      user.isPaid = true;
      user.currentSemesterMember = true;
      const shoe = new ShoeModel();
      shoe.rentable = 1;
      const rent = new RentModel();
      rent.size = size;
      rent.User = user;
      rent.rent_date = new Date('2024-08-01');
      jest.spyOn(dataSources, 'createQueryRunner').mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        release: jest.fn(),
        rollbackTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        manager: {
          save: jest.fn(),
        },
      } as any);
      const QueryRunner = dataSources.createQueryRunner();

      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(rentRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(shoeRepository, 'findOne').mockResolvedValue(shoe);
      jest.spyOn(rentRepository, 'save').mockResolvedValue(rent);

      // WHEN
      const result = await rentService.rentShoe(userId, size);
      // THEN
      expect(result).toBe('대여 완료');
      expect(QueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(QueryRunner.release).toHaveBeenCalledTimes(1);
    });

    test('알 수 없는 에러 발생 시 BadRequestException 반환', async () => {
      // GIVEN
      const userId = 1;
      const size = 230;
      const user = new UserModel();
      user.isPaid = true;
      user.currentSemesterMember = true;
      const shoe = new ShoeModel();
      shoe.rentable = 1;
      const rent = new RentModel();
      rent.size = size;
      rent.User = user;
      rent.rent_date = new Date('2024-08-01');
      jest.spyOn(dataSources, 'createQueryRunner').mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        release: jest.fn(),
        rollbackTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        manager: {
          save: jest.fn(),
        },
      } as any);
      const QueryRunner = dataSources.createQueryRunner();

      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(rentRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(shoeRepository, 'findOne').mockResolvedValue(shoe);
      jest.spyOn(QueryRunner.manager, 'save').mockRejectedValue(new Error());
      // WHEN
      // THEN
      await expect(rentService.rentShoe(userId, size)).rejects.toThrow(
        BadRequestException,
      );

      expect(QueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(QueryRunner.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('returnShoe 테스트', () => {
    test('userId에 해당하는 유저가 없는 경우, NotFoundException 반환', async () => {
      // GIVEN
      jest.spyOn(dataSources, 'createQueryRunner').mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        release: jest.fn(),
        rollbackTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        manager: {
          save: jest.fn(),
        },
      } as any);
      const QueryRunner = dataSources.createQueryRunner();
      const userId = 1;
      const size = 230;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(rentService.returnShoe(userId, size)).rejects.toThrow(
        NotFoundException,
      );
      await expect(rentService.returnShoe(userId, size)).rejects.toThrow(
        '회원 정보를 찾을 수 없습니다.',
      );
    });

    test('대여한 기록이 없는 경우, NotFoundException 반환', async () => {
      // GIVEN
      jest.spyOn(dataSources, 'createQueryRunner').mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        release: jest.fn(),
        rollbackTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        manager: {
          save: jest.fn(),
        },
      } as any);
      const QueryRunner = dataSources.createQueryRunner();
      const userId = 1;
      const size = 230;
      const user = new UserModel();
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(rentRepository, 'findOne').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(rentService.returnShoe(userId, size)).rejects.toThrow(
        NotFoundException,
      );
      await expect(rentService.returnShoe(userId, size)).rejects.toThrow(
        '해당 신발을 대여한 기록이 없습니다.',
      );
    });

    test('size에 해당하는 신발이 없는 경우, NotFoundException 반환', async () => {
      // GIVEN
      jest.spyOn(dataSources, 'createQueryRunner').mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        release: jest.fn(),
        rollbackTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        manager: {
          save: jest.fn(),
        },
      } as any);
      const QueryRunner = dataSources.createQueryRunner();
      const userId = 1;
      const size = 230;
      const user = new UserModel();
      const rent = new RentModel();
      rent.User = user;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(rentRepository, 'findOne').mockResolvedValue(rent);
      jest.spyOn(shoeRepository, 'findOne').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(rentService.returnShoe(userId, size)).rejects.toThrow(
        NotFoundException,
      );
      await expect(rentService.returnShoe(userId, size)).rejects.toThrow(
        '해당 사이즈의 신발이 없습니다.',
      );
    });

    test('반납 가능 암벽화의 수가 전체 암벽화의 개수보다 많은 경우 BadRequestException 반환', async () => {
      // GIVEN
      jest.spyOn(dataSources, 'createQueryRunner').mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        release: jest.fn(),
        rollbackTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        manager: {
          save: jest.fn(),
        },
      } as any);
      const QueryRunner = dataSources.createQueryRunner();
      const userId = 1;
      const size = 230;
      const user = new UserModel();
      const rent = new RentModel();
      rent.User = user;
      const shoe = new ShoeModel();
      shoe.rentable = 0;
      shoe.count = 0;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(rentRepository, 'findOne').mockResolvedValue(rent);
      jest.spyOn(shoeRepository, 'findOne').mockResolvedValue(shoe);
      // WHEN
      // THEN
      await expect(rentService.returnShoe(userId, size)).rejects.toThrow(
        BadRequestException,
      );
      await expect(rentService.returnShoe(userId, size)).rejects.toThrow(
        '해당 사이즈의 신발이 모두 반납되었습니다.',
      );
    });

    test('암벽화 반납 성공', async () => {
      // GIVEN
      jest.spyOn(dataSources, 'createQueryRunner').mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        release: jest.fn(),
        rollbackTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        manager: {
          save: jest.fn(),
        },
      } as any);
      const QueryRunner = dataSources.createQueryRunner();
      const userId = 1;
      const size = 230;
      const user = new UserModel();
      const rent = new RentModel();
      rent.User = user;
      const shoe = new ShoeModel();
      shoe.rentable = 0;
      shoe.count = 1;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(rentRepository, 'findOne').mockResolvedValue(rent);
      jest.spyOn(shoeRepository, 'findOne').mockResolvedValue(shoe);
      jest.spyOn(shoeRepository, 'save').mockResolvedValue(shoe);
      // WHEN
      const result = await rentService.returnShoe(userId, size);
      // THEN
      expect(result).toBe('반납 완료');
      expect(QueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(QueryRunner.release).toHaveBeenCalledTimes(1);
    });

    test('알 수 없는 에러 발생 시 BadRequestException 반환', async () => {
      // GIVEN
      jest.spyOn(dataSources, 'createQueryRunner').mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        release: jest.fn(),
        rollbackTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        manager: {
          save: jest.fn(),
        },
      } as any);
      const QueryRunner = dataSources.createQueryRunner();
      const userId = 1;
      const size = 230;
      const user = new UserModel();
      const rent = new RentModel();
      rent.User = user;
      const shoe = new ShoeModel();
      shoe.rentable = 0;
      shoe.count = 1;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(rentRepository, 'findOne').mockResolvedValue(rent);
      jest.spyOn(shoeRepository, 'findOne').mockResolvedValue(shoe);
      jest.spyOn(shoeRepository, 'save').mockRejectedValue(new Error());

      // WHEN
      // THEN
      await expect(rentService.returnShoe(userId, size)).rejects.toThrow(
        BadRequestException,
      );
      expect(QueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(QueryRunner.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMyRentRecord 테스트', () => {
    test('대여 기록이 없는 경우 null 반환', async () => {
      // GIVEN
      const userId = 1;
      jest.spyOn(rentRepository, 'findOne').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(rentService.getMyRentRecord(userId)).resolves.toBeNull();
    });
    test('대여 기록이 있는 경우 User정보와 id delete하고 반환', async () => {
      // GIVEN
      const userId = 1;
      const myRent = new RentModel();
      myRent.User = new UserModel();
      myRent.User.id = 1;
      myRent.id = 1;
      jest.spyOn(rentRepository, 'findOne').mockResolvedValue(myRent);
      // WHEN
      const result = await rentService.getMyRentRecord(userId);
      // THEN
      expect(result).toEqual(myRent);
    });
  });
});
