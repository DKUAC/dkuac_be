import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModel } from './entities/schedule.entity';
import { UserModule } from 'src/auth/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleModel]), UserModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
