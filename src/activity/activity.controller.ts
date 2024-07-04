import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PostActivityDto } from './dto/activity.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  // 가장 최근 학기의 활동을 가져오는 API
  // 오늘 날짜를 기준으로 1학기는 3월~8월, 2학기는 9월~2월로 정의
  @Get()
  getAcitivityBySemseter() {
    return this.activityService.getAcitivityBySemseter();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  postAcitivity(
    @Req() req,
    @Body() dto: PostActivityDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('활동 사진을 업로드해주세요');
    }
    const { sub } = req.user;
    return this.activityService.postAcitivity(sub, dto, file.filename);
  }

  @Get(':activityId')
  getActivityById(@Param('activityId') id: number) {
    return this.activityService.getActivityById(id);
  }
}
