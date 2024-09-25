import { Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './entities/user.entity';
import { Repository } from 'typeorm';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
  ) {}
}
