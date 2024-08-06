import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { IncomingWebhook } from '@slack/webhook';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly configService: ConfigService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    Sentry.captureException(exception);
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.

    const url = this.configService.get('SLACK_ERROR_WEBHOOK_URL');
    const webhook = new IncomingWebhook(url);
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      error:
        exception instanceof Error ? exception.name : 'Internal Server Error',
      message:
        exception instanceof Error
          ? exception.message
          : 'Internal server error',
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    await webhook.send({
      attachments: [
        {
          color: 'danger',
          text: 'DKUAC 에러 발생',
          fields: [
            {
              title:
                exception instanceof Error
                  ? exception.name
                  : 'Internal Server Error',
              value:
                exception instanceof Error
                  ? exception.message
                  : 'Internal server error',
              short: false,
            },
          ],
          ts: Math.floor(new Date().getTime() / 1000).toString(),
        },
      ],
    });

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
