import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  public sendEmail(to: number, verificationCode: string) {
    this.mailerService
      .sendMail({
        to: `${to}@dankook.ac.kr`,
        from: 'noreply@dkuac.com',
        subject: 'DKUAC 회원가입을 위한 인증번호',
        text: `사이트로 돌아가 ${verificationCode}를 입력해주세요`,
      })
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
  }
}
