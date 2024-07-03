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
import { TransactionInterceptor } from 'src/common/interceptor/transactioin.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';

@Controller('rent')
export class RentController {
  constructor(private readonly rentService: RentService) {}

  @Get()
  async checkShoeCount() {
    const result = await this.rentService.checkShoeCount();
    return result;
  }

  @UseGuards(JwtAuthGuard)
  // @UseInterceptors(TransactionInterceptor)
  @Post()
  async rentShoe(
    @Req() req,
    // @QueryRunner() qr: QR,
    @Body('size') size: number,
  ) {
    const { sub } = req.user;
    if (!size) {
      throw new BadRequestException('사이즈를 입력해주세요.');
    }
    return await this.rentService.rentShoe(sub, size);
  }

  @UseGuards(JwtAuthGuard)
  @Post('return')
  async returnShoe(@Req() req, @Body('size') size: number) {
    const { sub } = req.user;
    if (!size) {
      throw new BadRequestException('사이즈를 입력해주세요.');
    }
    return await this.rentService.returnShoe(sub, size);
  }

  @Get('create-shoe')
  async createShoe() {
    return await this.rentService.createShoe();
  }
}
