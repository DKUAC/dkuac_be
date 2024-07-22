import { Test, TestingModule } from '@nestjs/testing';
import { RentController } from './rent.controller';
import { RentService } from './rent.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { RentShoeDto } from './dto/rent.dto';

describe('RentController', () => {
  let controller: RentController;
  let rentService: RentService;
  let mockReturn = 'test-return';
  let mockRequest: any = {
    user: {
      sub: 1,
    },
  };
  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RentController],
      providers: [
        {
          provide: RentService,
          useValue: {
            checkShoeCount: jest.fn().mockReturnValue(mockReturn),
            checkRent: jest.fn().mockReturnValue(mockReturn),
            rentShoe: jest.fn().mockReturnValue(mockReturn),
            returnShoe: jest.fn().mockReturnValue(mockReturn),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => true,
      })
      .compile();

    controller = module.get<RentController>(RentController);
    rentService = module.get<RentService>(RentService);
  });

  test('암벽화 사이즈 및 수량을 제대로 반환해주는지 테스트', async () => {
    // GIVEN
    // WHEN
    const result = await controller.checkShoeCount();
    // THEN
    expect(rentService.checkShoeCount).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockReturn);
  });

  test('암벽화 대여한 사람 있는지 확인', async () => {
    // GIVEN
    // WHEN
    const result = await controller.checkRent();
    // THEN
    expect(rentService.checkRent).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockReturn);
  });

  describe('신발 대여하기', () => {
    test('신발 대여 성공', async () => {
      // GIVEN
      const dto = new RentShoeDto();
      dto.size = 250;
      // WHEN
      const result = await controller.rentShoe(mockRequest, dto);
      // THEN
      expect(rentService.rentShoe).toHaveBeenCalledWith(1, dto.size);
      expect(result).toEqual(mockReturn);
    });

    test('dto 내 size를 입력하지 않은 경우 에러 반환', async () => {
      // GIVEN
      const dto = new RentShoeDto();

      // WHEN
      // THEN
      await expect(controller.rentShoe(mockRequest, dto)).rejects.toThrow(
        new BadRequestException('사이즈를 입력해주세요.'),
      );
    });
  });

  describe('신발 반납하기', () => {
    test('신발 반납 성공', async () => {
      // GIVEN
      const dto = new RentShoeDto();
      dto.size = 250;
      // WHEN
      const result = await controller.returnShoe(mockRequest, dto);
      // THEN
      expect(rentService.returnShoe).toHaveBeenCalledWith(1, dto.size);
      expect(result).toEqual(mockReturn);
    });

    test('dto 내 size를 입력하지 않은 경우 에러 반환', async () => {
      // GIVEN
      const dto = new RentShoeDto();

      // WHEN
      // THEN
      await expect(controller.returnShoe(mockRequest, dto)).rejects.toThrow(
        new BadRequestException('사이즈를 입력해주세요.'),
      );
    });
  });
});
