import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() dto: SignUpDto) {
    const reuslt = await this.authService.signUp(dto);
    return reuslt;
  }

  @Post('create-verification-code')
  async createVerificationCode(@Body('studentNumber') studentNumber: number) {
    await this.authService.createVerificationCodeAndSend(studentNumber);
  }

  @Post('is-verified')
  async isVerified(
    @Body('studentNumber') studentNumber: number,
    @Body('codeFromUser') codeFromUser: string,
  ) {
    return await this.authService.isVerified(studentNumber, codeFromUser);
  }
}
