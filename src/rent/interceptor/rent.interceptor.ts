import {
  CallHandler,
  ConsoleLogger,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { BaseInterceptor } from './base.interceptor';
import { Observable, tap } from 'rxjs';
import { IncomingWebhook } from '@slack/webhook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RentInterceptor extends BaseInterceptor {
  constructor(protected readonly configService: ConfigService) {
    super(configService);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.SLACK_WEBHOOK_URL = this.configService.get('SLACK_RENT_WEBHOOK_URL');
    const webhook = new IncomingWebhook(this.SLACK_WEBHOOK_URL);
    return super.intercept(context, next).pipe(
      tap(async () => {
        await webhook.send({
          text: `대여 요청이 들어왔습니다. 학번: ${this.studentNumber}, 크기: ${this.size}`,
        });
      }),
    );
  }
}
