import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ChangeUserToStaffDto,
  CreateVerificationCodeDto,
  FindMyPasswordDto,
  GenerateNewPasswordDto,
  IsVerifiedDto,
  PasswordChangeDto,
  PasswordCheckDto,
  SignUpDto,
} from './dto/auth.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Response, Request as ExpressRequest } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: '회원가입',
  })
  @Post('signup')
  async signUp(@Body() dto: SignUpDto, @Res() res: Response) {
    const result = await this.authService.signUp(dto);

    return res.status(201).send(result);
  }

  @ApiOperation({
    summary: '로그인',
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res() res: Response) {
    const refreshTokenExpirestime = await this.authService.getTokenExpiresTime(
      req.user.refreshToken,
    );
    res.cookie('refreshToken', req.user.refreshToken, {
      httpOnly: true,
      maxAge: refreshTokenExpirestime * 1000,
    });
    const getAccessTokenExpiredTime =
      await this.authService.getTokenExpiresTime(req.user.accessToken);
    let date = new Date();
    date.setSeconds(date.getSeconds() + getAccessTokenExpiredTime);
    delete req.user.refreshToken;
    return res.json({
      ...req.user,
      expiredTime: date,
    });
  }

  @ApiOperation({
    summary: '로그아웃',
  })
  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      path: '/',
    });

    return res.status(200).json({
      message: '로그아웃 되었습니다.',
    });
  }

  @ApiOperation({
    summary: '인증코드 생성 및 기입한 학번으로 인증번호 전송',
  })
  @ApiBody({
    type: CreateVerificationCodeDto,
  })
  @Post('create-verification-code')
  async createVerificationCode(
    @Body() dto: CreateVerificationCodeDto,
    @Res() res: Response,
  ) {
    const result = await this.authService.createVerificationCodeAndSend(
      dto.studentNumber,
    );

    return res.status(201).send(result);
  }

  @ApiOperation({
    summary:
      '사용자로부터 입력받은 인증번호가 우리가 전송한 인증번호와 일치하는지 확인',
  })
  @Post('is-verified')
  async isVerified(@Body() dto: IsVerifiedDto, @Res() res: Response) {
    const result = await this.authService.isVerified(
      dto.studentNumber,
      dto.codeFromUser,
    );

    return res.status(200).send(result);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: '비밀번호 확인',
  })
  @UseGuards(JwtAuthGuard)
  @Post('password-check')
  async passwordCheck(@Request() req, @Body() dto: PasswordCheckDto) {
    const { sub } = req.user;
    const result = await this.authService.passwordCheck(sub, dto.password);
    if (result === false) {
      return '비밀번호가 일치하지 않습니다.';
    }
    return {
      statusCode: 200,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: '비밀번호 변경',
  })
  @UseGuards(JwtAuthGuard)
  @Post('password-change')
  async passwordChange(@Request() req, @Body() dto: PasswordChangeDto) {
    const { sub } = req.user;
    await this.authService.passwordChange(sub, dto.newPassword);
    return {
      statusCode: 200,
      message: '비밀번호가 변경되었습니다.',
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: '일반 사용자를 스태프로 변경',
  })
  @UseGuards(JwtAuthGuard)
  @Post('change-normal-user-to-staff')
  async changeNormalUserToStaff(@Body() dto: ChangeUserToStaffDto) {
    const { userId } = dto;
    return await this.authService.changeNormalUserToStaff(userId);
  }

  @ApiOperation({
    summary: '비밀번호 찾기',
  })
  @Post('find-my-password')
  async findMyPassword(@Body() dto: FindMyPasswordDto) {
    const { studentNumber } = dto;
    const result = await this.authService.findMyPassword(studentNumber);
    return result;
  }

  @ApiOperation({
    summary: '새 비밀번호 생성',
  })
  @Post('generate-new-password')
  async generateNewPassword(@Body() dto: GenerateNewPasswordDto) {
    const { studentNumber } = dto;
    return await this.authService.generateNewPassword(studentNumber);
  }

  @ApiOperation({
    summary: '토큰 재발급',
  })
  @Get('token/access')
  async getAccessToken(@Request() req: ExpressRequest) {
    const refreshToken = req.cookies['refreshToken'];
    const result = await this.authService.rotateToken(refreshToken);
    return result;
  }

  @ApiOperation({
    summary: '토큰 만료 확인',
  })
  @Get('is-token-expired')
  @UseGuards(JwtAuthGuard)
  async checkTokenExpired(@Req() req) {
    return true;
  }
}
