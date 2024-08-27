import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RentService } from './rent.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RentShoeDto } from './dto/rent.dto';
import { RentInterceptor } from './interceptor/rent.interceptor';
import { ReturnInterceptor } from './interceptor/return.interceptor';

@ApiTags('rent')
@Controller('rent')
export class RentController {
  constructor(private readonly rentService: RentService) {}

  @ApiOperation({
    summary: '암벽화 사이즈 및 수량 확인',
  })
  @Get()
  async checkShoeCount() {
    const result = await this.rentService.checkShoeCount();
    return result;
  }

  @ApiOperation({
    summary: '암벽화 대여 기록 확인',
  })
  @UseGuards(JwtAuthGuard)
  @Get('check-rent')
  async checkRent() {
    return await this.rentService.checkRent();
  }

  @ApiOperation({
    summary: '내 암벽화 대여 기록 확인하기',
  })
  @UseGuards(JwtAuthGuard)
  @Get('my-rent-record')
  async getMyRentRecord(@Req() req) {
    const { sub } = req.user;
    const result = await this.rentService.getMyRentRecord(sub);
    return {
      message:
        result === null ? '대여 기록이 없습니다.' : '대여 기록이 있습니다.',
      data: result,
    };
  }

  @ApiOperation({
    summary: '신발 대여',
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(RentInterceptor)
  @Post()
  async rentShoe(@Req() req, @Body() dto: RentShoeDto) {
    const { sub } = req.user;
    if (!dto.size) {
      throw new BadRequestException('사이즈를 입력해주세요.');
    }
    const result = await this.rentService.rentShoe(sub, dto.size);
    return result;
  }

  @ApiOperation({
    summary: '신발 반납',
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ReturnInterceptor)
  @Post('return')
  async returnShoe(@Req() req, @Body() dto: RentShoeDto) {
    const { sub } = req.user;
    if (!dto.size) {
      throw new BadRequestException('사이즈를 입력해주세요.');
    }
    return await this.rentService.returnShoe(sub, dto.size);
  }

  // @ApiOperation({
  //   summary: '신발 추가',
  // })
  // @Get('create-shoe')
  // async createShoe() {
  //   return await this.rentService.createShoe();
  // }
}
