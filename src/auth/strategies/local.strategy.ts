import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'studentNumber',
      password: 'password',
    });
  }

  async validate(studentNumber: number, password: string): Promise<any> {
    const tokens = await this.authService.logIn({ studentNumber, password });
    if (!tokens) {
      throw new UnauthorizedException(
        `학번 ${studentNumber}에 해당하는 유저가 존재하지 않습니다.`,
      );
    }
    return tokens;
  }
}
