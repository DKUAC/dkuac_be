import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  public sendEmail(to: number) {
    this.mailerService
      .sendMail({
        to: `${to}@dankook.ac.kr`,
        from: 'noreply@dkuac.com',
        subject: '인증번호 발송!',
        text: '테스트',
        html: '<b>welcome</b>',
      })
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
  }
}
