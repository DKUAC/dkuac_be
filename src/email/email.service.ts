import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendEmail(
    to: string,
    message: string,
    verificationCode: string,
  ) {
    try {
      const isSent = await this.mailerService.sendMail({
        to: `${to}@dankook.ac.kr`,
        from: 'noreply@dkuac.com',
        subject: `DKUAC ${message}을 위한 인증번호`,
        text: `사이트로 돌아가 ${verificationCode}를 입력해주세요`,
      });
      return isSent;
    } catch (error) {
      throw new BadRequestException(
        '메일을 전송하던 중 에러가 발생했습니다. 다시 시도해주세요.',
        error.message,
      );
    }
  }

  public async sendNewPassword(
    email: string,
    message: string,
    newPassword: string,
  ) {
    try {
      const isSent = await this.mailerService.sendMail({
        to: `${email}@dankook.ac.kr`,
        from: 'noreply@dkuac.com',
        subject: message,
        text: `변경된 비밀번호는 ${newPassword}입니다. 사이트로 돌아가 로그인해주세요. 보안을 위해 비밀번호를 변경해주세요.`,
      });
      return isSent;
    } catch (error) {
      throw new BadRequestException(
        '유저에게 새 비밀번호를 전송하던 중 에러가 발생했습니다. 다시 시도해주세요.',
      );
    }
  }
}
