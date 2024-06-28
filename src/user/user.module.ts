import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from './entities/user.entity';

@Module({
  exports: [UserService],
  imports: [],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
