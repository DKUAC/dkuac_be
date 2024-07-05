import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  CreateScheduleDto,
  DeleteScheduleDto,
  EditScheduleDto,
  GetSheduleDto,
} from './dto/schedule.dto';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createSchedule(
    @Req() req,
    @Body() createScheduleDto: CreateScheduleDto,
  ) {
    const { sub } = req.user;
    return await this.scheduleService.createSchedule(sub, createScheduleDto);
  }

  @Get()
  async getSchedule(@Body() getScheduleDto: GetSheduleDto) {
    return await this.scheduleService.getSchedule(getScheduleDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async editSchedule(@Req() req, @Body() editScheduleDto: EditScheduleDto) {
    const { sub } = req.user;
    return await this.scheduleService.editSchedule(sub, editScheduleDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteSchedule(
    @Req() req,
    @Body() deleteScheduleDto: DeleteScheduleDto,
  ) {
    const { sub } = req.user;
    return await this.scheduleService.deleteSchedule(sub, deleteScheduleDto);
  }
}
