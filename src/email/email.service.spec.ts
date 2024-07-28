import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException } from '@nestjs/common';

describe('EmailService', () => {
  let mailerService: MailerService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(mailerService).toBeDefined();
  });

  test('sendEmail 테스트', async () => {
    // GIVEN
    const to = 12341234;
    const message = 'test message';
    const verificationCode = 'test code';
    const mockResult = { suggess: true };
    jest.spyOn(mailerService, 'sendMail').mockResolvedValue(mockResult);
    // WHEN
    const result = await emailService.sendEmail(to, message, verificationCode);
    // THEN
    expect(result).toEqual(mockResult);
    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: `${to}@dankook.ac.kr`,
      from: 'noreply@dkuac.com',
      subject: `DKUAC ${message}을 위한 인증번호`,
      text: `사이트로 돌아가 ${verificationCode}를 입력해주세요`,
    });
  });

  test('sendEmail 중 알수 없는 오류 발생 시 BadRequestException 발생', async () => {
    // GIVEN
    const to = 12341234;
    const message = 'test message';
    const verificationCode = 'test code';
    jest.spyOn(mailerService, 'sendMail').mockRejectedValue(new Error());
    // WHEN
    // THEN
    await expect(
      emailService.sendEmail(to, message, verificationCode),
    ).rejects.toThrow(BadRequestException);
    await expect(
      emailService.sendEmail(to, message, verificationCode),
    ).rejects.toThrow(
      '메일을 전송하던 중 에러가 발생했습니다. 다시 시도해주세요.',
    );
  });

  test('sendNewPassword 테스트 성공', async () => {
    // GIVEN
    const to = 12341234;
    const message = 'test message';
    const newPassword = '1234';
    const mockResult = { suggess: true };
    jest.spyOn(mailerService, 'sendMail').mockResolvedValue(mockResult);
    // WHEN
    const result = await emailService.sendNewPassword(to, message, newPassword);
    // THEN
    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: `${to}@dankook.ac.kr`,
      from: 'noreply@dkuac.com',
      subject: message,
      text: `변경된 비밀번호는 ${newPassword}입니다. 사이트로 돌아가 로그인해주세요. 보안을 위해 비밀번호를 변경해주세요.`,
    });
    expect(result).toEqual(mockResult);
  });

  test('sendEmail 중 알수 없는 오류 발생 시 BadRequestException 발생', async () => {
    // GIVEN
    const to = 12341234;
    const message = 'test message';
    const newPassword = '1234';
    jest.spyOn(mailerService, 'sendMail').mockRejectedValue(new Error());
    // WHEN
    // THEN
    await expect(
      emailService.sendNewPassword(to, message, newPassword),
    ).rejects.toThrow(BadRequestException);
    await expect(
      emailService.sendNewPassword(to, message, newPassword),
    ).rejects.toThrow(
      '유저에게 새 비밀번호를 전송하던 중 에러가 발생했습니다. 다시 시도해주세요.',
    );
  });
});
