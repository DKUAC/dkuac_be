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
    const { name, phone, studentNumber } = dto;
    let newName = name + '|' + String(phone.slice(7));

    const password = phone.slice(3);
    if (await this.findByStudentNumber(studentNumber)) {
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
        studentNumber: dto.studentNumber,
      },
      select: ['id', 'studentNumber', 'password'],
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

  async passwordCheck(id: number, password: string) {
    const reuslt = await this.isSamePassword(id, password);

    return reuslt;
  }

  async passwordChange(id: number, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }
    const isSamePassword = await this.isSamePassword(id, newPassword);
    if (isSamePassword) {
      throw new BadRequestException(
        '이전과 동일한 비밀번호는 사용할 수 없습니다.',
      );
    }

    const saltRounds = Number(
      this.configService.get<number>('BCRYPT_SALT_ROUNDS'),
    );
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const userObj = { ...user, password: hashedPassword };
    await this.userRepository.save(userObj);

    return '비밀번호 변경 성공';
  }

  async validateUser(studentNumber: number, pass: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        studentNumber: studentNumber,
      },
    });
    const ok = bcrypt.compareSync(pass, user?.password);

    if (user && ok) {
      return user;
    }

    return null;
  }

  async genUserToken(user: Pick<UserModel, 'studentNumber' | 'id'>) {
    return {
      acessToken: await this.genAccessToken(user),
      refreshToken: await this.genRefreshToken(user),
    };
  }

  private async isSamePassword(id: number, password: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }
    const result = bcrypt.compareSync(password, user?.password);

    return result;
  }

  private async genAccessToken(user: Pick<UserModel, 'studentNumber' | 'id'>) {
    const payload = { studentNumber: user.studentNumber, sub: user.id };
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

  private async genRefreshToken(user: Pick<UserModel, 'studentNumber' | 'id'>) {
    const payload = { studentNumber: user.studentNumber, sub: user.id };
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

  private async findByStudentNumber(studentNumber: number) {
    return await this.userRepository.existsBy({
      studentNumber,
    });
  }

  private generateVerifcationCode() {
    return String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  }
}
