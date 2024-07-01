import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserModel } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { LogInDto, SignUpDto } from './dto/auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly jwtService: JwtService,
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

  async logIn(dto: LogInDto) {
    const user = await this.userRepository.findOne({
      where: {
        student_number: dto.student_number,
      },
      select: ['id', 'student_number', 'password'],
    });
    if (!user) {
      throw new BadRequestException('학번 혹은 비밀번호를 확인해주세요.');
    }
    const ok = bcrypt.compareSync(dto.password, user?.password);
    if (!ok) {
      throw new BadRequestException('학번 혹은 비밀번호를 확인해주세요.');
    }

    const tokens = await this.genUserToken(user);
    return {
      user: {
        id: user.id,
      },
      ...tokens,
    };
  }

  async validateUser(studentNumber: number, pass: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        student_number: studentNumber,
      },
    });
    const ok = bcrypt.compareSync(pass, user?.password);

    if (user && ok) {
      return user;
    }

    return null;
  }

  async genUserToken(user: Pick<UserModel, 'student_number' | 'id'>) {
    return {
      acessToken: await this.genAccessToken(user),
      refreshToken: await this.genRefreshToken(user),
    };
  }

  private async genAccessToken(user: Pick<UserModel, 'student_number' | 'id'>) {
    const payload = { studentNumber: user.student_number, sub: user.id };
    const acessToken = await this.jwtService.signAsync(
      {
        ...payload,
        type: 'access',
      },
      {
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_TOKEN_EXPIRATION',
        ),
      },
    );
    return acessToken;
  }

  private async genRefreshToken(
    user: Pick<UserModel, 'student_number' | 'id'>,
  ) {
    const payload = { studentNumber: user.student_number, sub: user.id };
    const refreshToken = await this.jwtService.signAsync(
      {
        ...payload,
        type: 'refresh',
      },
      {
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_TOKEN_EXPIRATION',
        ),
      },
    );
    return refreshToken;
  }

  private async findByStudentNumber(student_number: number) {
    return await this.userRepository.existsBy({
      student_number,
    });
  }

  private generateVerifcationCode() {
    return String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  }
}
