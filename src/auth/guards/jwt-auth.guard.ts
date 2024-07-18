import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: Error) {
    if (err || !user) {
      console.log('JwtAuthGuard - Unauthorized:', info?.message);
      if (info.message === 'jwt expired') {
        throw new UnauthorizedException('토큰이 만료되었습니다.');
      }
      throw (
        err ||
        new UnauthorizedException('로그인 한 회원만 사용가능한 기능입니다.')
      );
    }
    return user;
  }
}
