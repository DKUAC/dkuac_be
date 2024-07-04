import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PostActivityDto } from './dto/activity.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

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
  @UseInterceptors(FilesInterceptor('images'))
  postAcitivity(
    @Req() req,
    @Body() dto: PostActivityDto,
    @UploadedFiles() file: Express.Multer.File[],
  ) {
    if (file.length === 0 || !file) {
      throw new BadRequestException('활동 사진을 업로드해주세요');
    }

    const { sub } = req.user;
    const fileNames = file.map((f) => f.filename);
    return this.activityService.postAcitivity(sub, dto, fileNames);
  }

  @Get(':activityId')
  getActivityById(@Param('activityId') id: number) {
    return this.activityService.getActivityById(id);
  }

  @Delete(':activityId')
  @UseGuards(JwtAuthGuard)
  deleteActivity(@Req() req, @Param('activityId') id: number) {
    const { sub } = req.user;
    return this.activityService.deleteActivity(sub, id);
  }
}
