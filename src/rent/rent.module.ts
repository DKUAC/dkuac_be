import { Module } from '@nestjs/common';
import { RentService } from './rent.service';
import { RentController } from './rent.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RentModel } from './entities/rent.entity';
import { ShoeModel } from './entities/shoe.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([RentModel, ShoeModel]), UserModule],
  controllers: [RentController],
  providers: [RentService],
})
export class RentModule {}