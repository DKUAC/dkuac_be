import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const now = new Date();
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const path = req.path;

    console.log(`[REQ] ${method} ${path} ${now.toLocaleString('kr')}`);
    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(
            `[RES] ${method} ${path} ${new Date().toLocaleString('kr')} ${new Date().getTime() - now.getTime()}ms`,
          ),
        ),
      );
  }
}
