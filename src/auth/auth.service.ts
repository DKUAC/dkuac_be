import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserModel } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/sign-up.dto';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  /**
   *
   * Todo
   *
   * [] 비밀번호 변경
   * [] 로그인 구현
   */

  async signUp(dto: SignUpDto) {
    const { name, phone, student_number } = dto;
    let newName = name + '|' + String(phone.slice(7));

    const password = phone.slice(3);
    if (await this.findByStudentNumber(student_number)) {
      throw new UnauthorizedException('이미 가입된 회원입니다.');
    }

    const saltRounds = Number(
      this.configService.get<number>('BCRYPT_SALT_ROUNDS'),
    );
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userObj = { ...dto, name: newName, password: hashedPassword };
    const user = await this.userRepository.save(userObj);
    return user;
  }

  private async findByStudentNumber(student_number: number) {
    return await this.userRepository.existsBy({
      student_number,
    });
  }

  private generateVerifcationCode() {
    return String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  }

  async createVerificationCodeAndSend(studentNumber: number) {
    const verifcationCode: string = this.generateVerifcationCode();
    await this.cacheManager.set(`${studentNumber}`, verifcationCode, 3000000);
    this.emailService.sendEmail(studentNumber, verifcationCode);
  }

  async isVerified(studentNumber: number, codeFromUser: string) {
    const verificationCode = await this.cacheManager.get<string>(
      `${studentNumber}`,
    );
    return verificationCode === codeFromUser;
  }
}
