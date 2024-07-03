import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PostActivityDto } from './dto/activity.dto';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  // 가장 최근 학기의 활동을 가져오는 API
  // 오늘 날짜를 기준으로 1학기는 3월~8월, 2학기는 9월~2월로 정의
  @Get()
  getAcitivityBySemseter() {
    return this.activityService.getAcitivityBySemseter();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  postAcitivity(@Req() req, @Body() dto: PostActivityDto) {
    const { sub } = req.user;
    return this.activityService.postAcitivity(sub, dto);
  }

  @Get(':activityId')
  getActivityById(
    @Param('activityId') id: number,
    @Body() dto: PostActivityDto,
  ) {
    return this.activityService.getActivityById(id);
  }
}
