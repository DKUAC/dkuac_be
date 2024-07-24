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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Activity')
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  // 가장 최근 학기의 활동을 가져오는 API
  // 오늘 날짜를 기준으로 1학기는 3월~8월, 2학기는 9월~2월로 정의
  @ApiOperation({
    summary: '가장 최근 학기의 활동을 가져오는 API',
  })
  @Get()
  getActivityBySemseter() {
    return this.activityService.getActivityBySemseter();
  }

  @ApiOperation({
    summary: '활동 등록',
  })
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

  @ApiOperation({
    summary: '특정 활동 조회',
  })
  @Get(':activityId')
  getActivityById(@Param('activityId') id: number) {
    return this.activityService.getActivityById(id);
  }

  @ApiOperation({
    summary: '활동 수정',
  })
  @Put(':activityId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images'))
  async updateActivity(
    @Req() req,
    @Param('activityId') id: number,
    @Body() dto: EditActivityDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const { sub } = req.user;
    if (files) {
      console.log('if files');
      console.log(files);
      const fileNames = files.map((f) => f.filename);
      return this.activityService.updateActivity(sub, id, dto, fileNames);
    }
    console.log('if no files');
    console.log(files);
    return await this.activityService.updateActivity(sub, id, dto);
  }

  @ApiOperation({
    summary: '활동 삭제',
  })
  @Delete(':activityId')
  @UseGuards(JwtAuthGuard)
  deleteActivity(@Req() req, @Param('activityId') id: number) {
    const { sub } = req.user;
    return this.activityService.deleteActivity(sub, id);
  }
}
