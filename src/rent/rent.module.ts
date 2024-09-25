import { Module } from '@nestjs/common';
import { RentService } from './rent.service';
import { RentController } from './rent.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RentModel } from './entities/rent.entity';
import { ShoeModel } from './entities/shoe.entity';
import { UserModule } from 'src/auth/user/user.module';
import { RentLogModel } from './entities/rent-log.entity';
import { ReturnLogModel } from './entities/return-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RentModel,
      ShoeModel,
      RentLogModel,
      ReturnLogModel,
    ]),
    UserModule,
  ],
  controllers: [RentController],
  providers: [RentService],
})
export class RentModule {}
