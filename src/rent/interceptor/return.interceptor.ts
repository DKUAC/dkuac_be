import { CallHandler, ExecutionContext, Injectable } from '@nestjs/common';
import { BaseInterceptor } from './base.interceptor';
import { Observable, tap } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { IncomingWebhook } from '@slack/webhook';

@Injectable()
export class ReturnInterceptor extends BaseInterceptor {
  constructor(protected readonly configService: ConfigService) {
    super(configService);
  }
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.SLACK_WEBHOOK_URL = this.configService.get('SLACK_RETURN_WEBHOOK_URL');
    const webhook = new IncomingWebhook(this.SLACK_WEBHOOK_URL);
    return super.intercept(context, next).pipe(
      tap(async () => {
        await webhook.send({
          text: `반납 요청이 들어왔습니다. 학번: ${this.studentNumber}, 크기: ${this.size}`,
        });
      }),
    );
  }
}
