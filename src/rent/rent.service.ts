import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RentModel } from './entities/rent.entity';
import { Repository } from 'typeorm';
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
  ) {}

  async checkShoeCount() {
    return await this.shoeRepository.find({
      select: ['size', 'count'],
    });
  }

  async rentShoe(userId: number, size: number) {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new BadRequestException('회원 정보를 찾을 수 없습니다.');
    }

    if (user.is_paid === false || user.current_semester_member === false) {
      throw new BadRequestException(
        '회원 가입 또는 회비 납부 후 이용 가능합니다.',
      );
    }

    const shoe = await this.shoeRepository.findOne({
      where: {
        size,
      },
    });

    if (!shoe || shoe.count === 0) {
      throw new BadRequestException('해당 사이즈의 신발이 없습니다.');
    }

    shoe.count -= 1;
    // 누가 빌렸는지 rent 테이블에 저장해야함.
    // 트랜잭션 적용해야함
    // await this.shoeRepository.save(shoe);
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
