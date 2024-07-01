import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LogInDto, SignUpDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: '회원가입',
  })
  @Post('signup')
  async signUp(@Body() dto: SignUpDto) {
    const reuslt = await this.authService.signUp(dto);
    return reuslt;
  }

  @ApiOperation({
    summary: '로그인',
  })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return req.user;
  }

  @ApiOperation({
    summary: '인증코드 생성 및 기입한 학번으로 인증번호 전송',
  })
  @Post('create-verification-code')
  async createVerificationCode(@Body('studentNumber') studentNumber: number) {
    await this.authService.createVerificationCodeAndSend(studentNumber);
  }

  @ApiOperation({
    summary:
      '사용자로부터 입력받은 인증번호가 우리가 전송한 인증번호와 일치하는지 확인',
  })
  @Post('is-verified')
  async isVerified(
    @Body('studentNumber') studentNumber: number,
    @Body('codeFromUser') codeFromUser: string,
  ) {
    return await this.authService.isVerified(studentNumber, codeFromUser);
  }

  @ApiOperation({
    summary: '비밀번호 변경',
  })
  @Post('password-change')
  async passwordChange() {}
}
