import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
  GetDayScheduleDto,
  GetSheduleDto,
} from './dto/schedule.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @ApiOperation({
    summary: '스케줄 생성',
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  async createSchedule(
    @Req() req,
    @Body() createScheduleDto: CreateScheduleDto,
  ) {
    const { sub } = req.user;
    return await this.scheduleService.createSchedule(sub, createScheduleDto);
  }

  @ApiOperation({
    summary: '스케줄 조회',
  })
  @Get()
  async getSchedule(@Body() getScheduleDto: GetSheduleDto) {
    return await this.scheduleService.getSchedule(getScheduleDto);
  }

  @ApiOperation({
    summary: '특정 날짜 스케쥴 조회',
  })
  @Get('day/:date')
  async getDaySchedule(@Param('date') date: Date) {
    return await this.scheduleService.getDaySchedule(date);
  }

  @ApiOperation({
    summary: '스케줄 수정',
  })
  @UseGuards(JwtAuthGuard)
  @Put()
  async editSchedule(@Req() req, @Body() editScheduleDto: EditScheduleDto) {
    const { sub } = req.user;
    return await this.scheduleService.editSchedule(sub, editScheduleDto);
  }

  @ApiOperation({
    summary: '스케줄 삭제',
  })
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
