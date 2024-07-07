import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EditActivityDto, PostActivityDto } from './dto/activity.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  // 가장 최근 학기의 활동을 가져오는 API
  // 오늘 날짜를 기준으로 1학기는 3월~8월, 2학기는 9월~2월로 정의
  @Get()
  getActivityBySemseter() {
    return this.activityService.getActivityBySemseter();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 3))
  postActivity(
    @Req() req,
    @Body() dto: PostActivityDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (files.length === 0 || !files) {
      throw new BadRequestException('활동 사진을 업로드해주세요');
    }

    const { sub } = req.user;
    const fileNames = files.map((f) => f.filename);
    return this.activityService.postActivity(sub, dto, fileNames);
  }

  @Get(':activityId')
  getActivityById(@Param('activityId') id: number) {
    return this.activityService.getActivityById(id);
  }

  @Put(':activityId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images'))
  updateActivity(
    @Req() req,
    @Param('activityId') id: number,
    @Body() dto: EditActivityDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const { sub } = req.user;
    if (files) {
      const fileNames = files.map((f) => f.filename);
      return this.activityService.updateActivity(sub, id, dto, fileNames);
    }
    return this.activityService.updateActivity(sub, id, dto);
  }

  @Delete(':activityId')
  @UseGuards(JwtAuthGuard)
  deleteActivity(@Req() req, @Param('activityId') id: number) {
    const { sub } = req.user;
    return this.activityService.deleteActivity(sub, id);
  }
}
