import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RentModel } from './entities/rent.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { ShoeModel } from './entities/shoe.entity';
import { UserService } from 'src/auth/user/user.service';
import { RentLogModel } from './entities/rent-log.entity';
import { ReturnLogModel } from './entities/return-log.entity';

@Injectable()
export class RentService {
  constructor(
    @InjectRepository(RentModel)
    private readonly rentRepository: Repository<RentModel>,
    @InjectRepository(RentLogModel)
    private readonly rentLogRepository: Repository<RentLogModel>,
    @InjectRepository(ShoeModel)
    private readonly shoeRepository: Repository<ShoeModel>,
    private readonly userService: UserService,
    private readonly dataSources: DataSource,
  ) {}

  async checkShoeCount() {
    return await this.shoeRepository.find({
      select: ['size', 'count', 'rentable'],
    });
  }

  async checkRent() {
    const rents = await this.rentRepository.find({});

    return rents.map((rent) => ({
      size: rent.size,
      rent_date: rent.rent_date,
      name: rent.User.name.split('|')[0],
    }));
  }

  async rentShoe(userId: number, size: number) {
    const QueryRunner = this.dataSources.createQueryRunner();

    await QueryRunner.connect();
    await QueryRunner.startTransaction();

    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('회원 정보를 찾을 수 없습니다.');
    }

    if (user.isPaid === false || user.currentSemesterMember === false) {
      throw new UnauthorizedException(
        '회원 가입 또는 회비 납부 후 이용 가능합니다.',
      );
    }

    const shoe = await this.shoeRepository.findOne({
      where: {
        size,
      },
    });

    const dupRentCheck = await this.rentRepository.findOne({
      where: {
        User: {
          id: userId,
        },
      },
    });

    if (dupRentCheck) {
      throw new BadRequestException('1인당 1개의 신발만 대여 가능합니다.');
    }

    if (!shoe || shoe.rentable === 0) {
      throw new NotFoundException('해당 사이즈의 신발이 없습니다.');
    }

    try {
      shoe.rentable -= 1;
      const rent = new RentModel();
      rent.size = size;
      rent.User = user;
      rent.rent_date = new Date();
      const rentLog = new RentLogModel();
      rentLog.size = rent.size;
      rentLog.rent_date = rent.rent_date;
      rentLog.rent_student_number = rent.User.studentNumber;
      await QueryRunner.manager.save(shoe);
      await QueryRunner.manager.save(rent);
      await QueryRunner.manager.save(rentLog);
      await QueryRunner.commitTransaction();
      return '대여 완료';
    } catch (error) {
      await QueryRunner.rollbackTransaction();
      throw new BadRequestException(
        `대여에 실패했습니다. 다시 시도해주세요. - 에러 원인${error}`,
      );
    } finally {
      await QueryRunner.release();
    }
  }

  async returnShoe(userId: number, size: number) {
    const QueryRunner = this.dataSources.createQueryRunner();

    await QueryRunner.connect();
    await QueryRunner.startTransaction();

    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('회원 정보를 찾을 수 없습니다.');
    }

    const rent = await this.rentRepository.findOne({
      where: {
        size,
        User: {
          id: userId,
        },
      },
    });

    if (!rent) {
      throw new NotFoundException('해당 신발을 대여한 기록이 없습니다.');
    }

    const shoe = await this.shoeRepository.findOne({
      where: {
        size,
      },
    });

    if (!shoe) {
      throw new NotFoundException('해당 사이즈의 신발이 없습니다.');
    }

    shoe.rentable += 1;
    if (shoe.rentable > shoe.count) {
      throw new BadRequestException(
        '해당 사이즈의 신발이 모두 반납되었습니다.',
      );
    }

    try {
      await this.shoeRepository.save(shoe);
      await this.rentRepository.delete({
        id: rent.id,
      });
      const returnLog = new ReturnLogModel();
      returnLog.size = size;
      returnLog.return_date = new Date();
      returnLog.return_student_number = user.studentNumber;

      const rentedLog = await this.rentLogRepository.findOne({
        where: {
          size,
          rent_student_number: user.studentNumber,
        },
        order: {
          createdAt: 'DESC',
        },
      });
      returnLog.rented = rentedLog;
      await QueryRunner.manager.save(returnLog);
      await QueryRunner.commitTransaction();
      return '반납 완료';
    } catch (error) {
      await QueryRunner.rollbackTransaction();
      throw new BadRequestException(
        `반납에 실패했습니다. 다시 시도해주세요. - 에러 원인${error}`,
      );
    } finally {
      QueryRunner.release();
    }
  }

  async getMyRentRecord(userId: number) {
    const myRent = await this.rentRepository.findOne({
      where: {
        User: {
          id: userId,
        },
      },
      select: ['id', 'size'],
    });
    if (myRent === null) {
      return myRent;
    }

    delete myRent.User;
    delete myRent.id;

    return myRent;
  }

  // async createShoe() {
  //   for (let i = 0; i < 12; i++) {
  //     const shoe = new ShoeModel();
  //     shoe.size = 230 + i * 5;
  //     switch (shoe.size) {
  //       case 230:
  //         shoe.count = 0;
  //         break;
  //       case 235:
  //         shoe.count = 2;
  //         break;
  //       case 240:
  //         shoe.count = 4;
  //         break;
  //       case 245:
  //         shoe.count = 2;
  //         break;
  //       case 250:
  //         shoe.count = 3;
  //         break;
  //       case 255:
  //         shoe.count = 1;
  //         break;
  //       case 260:
  //         shoe.count = 3;
  //         break;
  //       case 265:
  //         shoe.count = 2;
  //         break;
  //       case 270:
  //         shoe.count = 4;
  //         break;
  //       case 275:
  //         shoe.count = 1;
  //         break;
  //       case 280:
  //         shoe.count = 3;
  //         break;
  //       case 285:
  //         shoe.count = 2;
  //         break;
  //     }
  //     shoe.rentable = shoe.count;
  //     await this.shoeRepository.save(shoe);
  //   }
  // }
}
