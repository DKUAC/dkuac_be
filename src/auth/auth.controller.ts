import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LogInDto, SignUpDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() dto: SignUpDto) {
    const reuslt = await this.authService.signUp(dto);
    return reuslt;
  }

  @Post('login')
  async login(@Body() dto: LogInDto) {
    const result = await this.authService.logIn(dto);
    return result;
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
  @Post('password-change')
  async passwordChange() {}
}
