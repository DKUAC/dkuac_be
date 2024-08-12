import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
  ) {}

  async findUserById(id: number) {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async findUserByStudentNumber(studentNumber: number) {
    return await this.userRepository.findOne({
      where: {
        studentNumber,
      },
    });
  }
}
