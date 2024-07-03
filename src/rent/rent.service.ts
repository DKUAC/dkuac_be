import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RentModel } from './entities/rent.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { ShoeModel } from './entities/shoe.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RentService {
  constructor(
    @InjectRepository(RentModel)
    private readonly rentRepository: Repository<RentModel>,
    @InjectRepository(ShoeModel)
    private readonly shoeRepository: Repository<ShoeModel>,
    private readonly userService: UserService,
    private readonly dataSources: DataSource,
  ) {}

  async checkShoeCount() {
    return await this.shoeRepository.find({
      select: ['size', 'count'],
    });
  }

  // 트랜잭션 적용해야함
  async rentShoe(userId: number, size: number) {
    const QueryRunner = this.dataSources.createQueryRunner();

    await QueryRunner.connect();
    await QueryRunner.startTransaction();
    try {
      const user = await this.userService.findUserById(userId);
      if (!user) {
        throw new BadRequestException('회원 정보를 찾을 수 없습니다.');
      }

      if (
        // user.is_paid === false ||

        user.current_semester_member === false
      ) {
        throw new BadRequestException(
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

      if (!shoe || shoe.count === 0) {
        throw new BadRequestException('해당 사이즈의 신발이 없습니다.');
      }

      shoe.count -= 1;
      const rent = new RentModel();
      rent.size = size;
      rent.User = user;
      rent.rent_date = new Date();
      await QueryRunner.manager.save(shoe);
      await QueryRunner.manager.save(rent);
      await QueryRunner.commitTransaction();
      return '대여 완료';
    } catch (error) {
      await QueryRunner.rollbackTransaction();
      throw error;
    } finally {
      await QueryRunner.release();
    }
  }

  async returnShoe(userId: number, size: number) {
    const QueryRunner = this.dataSources.createQueryRunner();

    await QueryRunner.connect();
    await QueryRunner.startTransaction();

    try {
      const user = await this.userService.findUserById(userId);
      if (!user) {
        throw new BadRequestException('회원 정보를 찾을 수 없습니다.');
      }

      const shoe = await this.shoeRepository.findOne({
        where: {
          size,
        },
      });

      if (!shoe) {
        throw new BadRequestException('해당 사이즈의 신발이 없습니다.');
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
        throw new BadRequestException('해당 신발을 대여한 기록이 없습니다.');
      }

      shoe.count += 1;
      await this.shoeRepository.save(shoe);
      await this.rentRepository.delete({
        id: rent.id,
      });

      return '반납 완료';
    } catch (error) {
      await QueryRunner.rollbackTransaction();
      throw error;
    } finally {
      QueryRunner.release();
    }
  }

  async createShoe() {
    for (let i = 0; i < 20; i++) {
      const shoe = new ShoeModel();
      shoe.size = 230 + i * 5;
      shoe.count = 10;
      await this.shoeRepository.save(shoe);
    }
  }
}
