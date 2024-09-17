import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'DKUAC 홈페이지 백엔드 서버입니다~!';
  }
}
