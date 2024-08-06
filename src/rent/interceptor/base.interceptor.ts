import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, tap } from 'rxjs';

@Injectable()
export class BaseInterceptor implements NestInterceptor {
  protected studentNumber: number;
  protected size: number;
  protected SLACK_WEBHOOK_URL: string;
  constructor(protected readonly configService: ConfigService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const {
      user: { studentNumber },
      body: { size },
    } = req;
    this.studentNumber = studentNumber;
    this.size = size;
    return next.handle();
  }
}
