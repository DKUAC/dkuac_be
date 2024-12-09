import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
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
import { AwsService } from 'src/aws/aws.service';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

@ApiTags('Activity')
@Controller('activity')
export class ActivityController {
  constructor(
    private readonly activityService: ActivityService,
    private readonly awsService: AwsService,
  ) {}

  // 가장 최근 학기의 활동을 가져오는 API
  // 오늘 날짜를 기준으로 1학기는 3월~8월, 2학기는 9월~2월로 정의
  @ApiOperation({
    summary: '가장 최근 학기의 활동을 가져오는 API',
  })
  @Get()
  async getActivityByYearAndSemseter(
    @Query('year') year: number,
    @Query('semester') semester: number,
  ) {
    const result = await this.activityService.getActivityByYearAndSemseter(
      year,
      semester,
    );
    return result;
  }

  @ApiOperation({
    summary: '활동 등록',
  })
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 3))
  async postActivity(
    @Req() req,
    @Body() dto: PostActivityDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (files.length === 0 || !files) {
      throw new BadRequestException('활동 사진을 업로드해주세요');
    }

    const { sub } = req.user;

    const uploadUrls = await Promise.all(
      files.map(async (f) => {
        // 고유한 파일 이름 생성
        const fileName = `${uuid()}${extname(f.originalname)}`;
        // S3에 파일 업로드
        const url = await this.awsService.imageUploadToS3(
          fileName,
          f, // f.buffer를 통해 파일 내용을 S3에 업로드
          extname(f.originalname),
        );

        return url;
      }),
    );

    return this.activityService.postActivity(sub, dto, uploadUrls);
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('images', 3))
  async uploadImage(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('파일이 업로드되지 않았습니다.');
    }

    const uploadUrls = await Promise.all(
      files.map(async (f) => {
        // 고유한 파일 이름 생성
        const fileName = `${uuid()}${extname(f.originalname)}`;
        // S3에 파일 업로드
        const url = await this.awsService.imageUploadToS3(
          fileName,
          f, // f.buffer를 통해 파일 내용을 S3에 업로드
          extname(f.originalname),
        );

        return url;
      }),
    );

    return { urls: uploadUrls };
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
      const fileNames = files.map((f) => f.filename);
      return this.activityService.updateActivity(sub, id, dto, fileNames);
    }
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
