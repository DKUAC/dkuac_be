import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { LogInDto, SignUpDto } from './dto/auth.dto';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let configService: ConfigService;
  let emailService: EmailService;
  let cacheManager: Cache;
  let jwtService: JwtService;
  let userRepository: Repository<UserModel>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn(),
            sendNewPassword: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
            verifyAsync: jest.fn(),
            signAsync: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserModel),
          useValue: {
            existsBy: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
    emailService = module.get<EmailService>(EmailService);
    jwtService = module.get<JwtService>(JwtService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    userRepository = module.get<Repository<UserModel>>(
      getRepositoryToken(UserModel),
    );
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signUp 테스트', () => {
    test('이미 가입 된 회원의 경우 BadRequestExcdption 반환', async () => {
      // GIVEN
      const dto = new SignUpDto();
      dto.name = 'test';
      dto.phone = '01012345678';
      dto.studentNumber = 12345678;
      jest.spyOn(userRepository, 'existsBy').mockResolvedValue(true);
      // WHEN
      // THEN
      await expect(authService.signUp(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
    test('회원가입 성공', async () => {
      // GIVEN
      const dto = new SignUpDto();
      dto.name = 'test';
      dto.phone = '01012345678';
      dto.studentNumber = 12345678;
      const user = new UserModel();
      jest.spyOn(userRepository, 'existsBy').mockResolvedValue(false);
      jest.spyOn(configService, 'get').mockReturnValue(10);
      const bcryptHash = jest.fn().mockResolvedValue('hashedPassword');
      jest.spyOn(bcrypt, 'hash').mockImplementation(bcryptHash);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      // WHEN
      const result = await authService.signUp(dto);
      // THEN
      expect(result).toEqual(user);
    });
  });
  describe('createVerificationCodeAndSend 테스트', () => {
    test('createVerificationCodeAndSend 성공 ', async () => {
      // GIVEN
      const studentNumber = 12345678;
      const message = 'DKUAC 회원가입을 위한 인증번호';
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue(null);
      // WHEN
      const result = await authService.createVerificationCodeAndSend(
        studentNumber,
        message,
      );
      // THEN
      expect(result).toEqual('인증코드 전송 완료');
    });
  });

  describe('isVerified 테스트', () => {
    test('사용자로부터 받은 code와 verificationCode가 다른 경우 false 반환', async () => {
      // GIVEN
      const studentNumber = 12345678;
      const codeFromUser = '4321';
      const verificationCode = '1234';
      jest
        .spyOn(cacheManager as any, 'get')
        .mockResolvedValue(verificationCode);
      // WHEN
      // THEN
      await expect(
        authService.isVerified(studentNumber, codeFromUser),
      ).resolves.toBeFalsy();
    });

    test('isVerified 성공', async () => {
      // GIVEN
      const studentNumber = 12345678;
      const codeFromUser = '1234';
      const verificationCode = '1234';
      jest
        .spyOn(cacheManager as any, 'get')
        .mockResolvedValue(verificationCode);
      // WHEN
      const result = await authService.isVerified(studentNumber, codeFromUser);
      // THEN
      expect(result).toBeTruthy();
    });
  });

  describe('logIn 테스트', () => {
    test('입력으로 받은 studentId가 존재하지 않는 경우, NotFoundException 반환', async () => {
      // GIVEN
      const dto = new LogInDto();
      dto.studentNumber = 12345678;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(authService.logIn(dto)).rejects.toThrow(NotFoundException);
      await expect(authService.logIn(dto)).rejects.toThrow(
        '학번 혹은 비밀번호를 확인해주세요.',
      );
    });

    test('비밀번호가 일치하지 않는 경우, NotFoundException 반환', async () => {
      // GIVEN
      const dto = new LogInDto();
      dto.studentNumber = 12345678;
      const user = new UserModel();
      user.password = 'password';
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
      // WHEN
      // THEN
      await expect(authService.logIn(dto)).rejects.toThrow(NotFoundException);
      await expect(authService.logIn(dto)).rejects.toThrow(
        '학번 혹은 비밀번호를 확인해주세요.',
      );
    });

    test('로그인에 성공한 경우 userId, 임원진 여부, accessToken, refreshToken을 보내줌', async () => {
      // GIVEN
      const dto = new LogInDto();
      dto.studentNumber = 12345678;
      const user = new UserModel();
      user.id = 1;
      user.isStaff = false;
      user.password = 'password';
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      jest.spyOn(authService as any, 'genUserToken').mockResolvedValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      // WHEN
      const result = await authService.logIn(dto);
      // THEN
      expect(result).toEqual({
        user: {
          id: user.id,
          isStaff: user.isStaff,
        },
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });
  });

  describe('passwordCheck 테스트', () => {
    test('authService.isSamePassword 의 결과를 반환', async () => {
      // GIVEN
      const userId = 1;
      const password = 'password';
      const user = new UserModel();
      user.password = 'password';
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(authService as any, 'isSamePassword').mockResolvedValue(true);
      // WHEN
      const result = await authService.passwordCheck(userId, password);
      // THEN
      expect(result).toBeTruthy();
    });
  });

  describe('passwordChange 테스트', () => {
    test('입력으로 받은 id에 해당하는 유저가 존재하지 않는 경우, NotFoundException 반환', async () => {
      // GIVEN
      const userId = 1;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(
        authService.passwordChange(userId, 'password'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        authService.passwordChange(userId, 'password'),
      ).rejects.toThrow('존재하지 않는 유저입니다.');
    });

    test('이전과 동일한 비밀번호로 변경하려는 경우 BadRequestException 반환', async () => {
      // GIVEN
      const userId = 1;
      const user = new UserModel();
      user.password = 'password';
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(authService as any, 'isSamePassword').mockResolvedValue(true);
      // WHEN
      // THEN
      await expect(
        authService.passwordChange(userId, 'password'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        authService.passwordChange(userId, 'password'),
      ).rejects.toThrow('이전과 동일한 비밀번호는 사용할 수 없습니다.');
    });

    test('비밀번호 변경 성공', async () => {
      // GIVEN
      const userId = 1;
      const user = new UserModel();
      user.password = 'password';
      const bcryptHash = jest.fn().mockResolvedValue('hashedPassword');
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(authService as any, 'isSamePassword').mockResolvedValue(false);
      jest.spyOn(bcrypt, 'hash').mockImplementation(bcryptHash);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      // WHEN
      const result = await authService.passwordChange(userId, 'password');
      // THEN
      expect(result).toEqual('비밀번호 변경 성공');
    });
  });

  describe('validateUser 테스트', () => {
    test('studentId에 해당하는 유저가 존재하고, 비밀번호가 일치한 경우 stduentId에 해당하는 유저 반환', async () => {
      // GIVEN
      const studentNumber = 12345678;
      const pass = 'password';
      const user = new UserModel();
      user.password = 'password';
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      // WHEN
      const result = await authService.validateUser(studentNumber, pass);
      // THEN
      expect(result).toEqual(user);
    });
    test('studentId에 해당하는 유저가 존재하지 않는 경우 null 반환', async () => {
      // GIVEN
      const studentNumber = 12345678;
      const pass = 'password';
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      // WHEN
      const result = await authService.validateUser(studentNumber, pass);
      // THEN
      expect(result).toBeNull();
    });
    test('studentId에 해당하는 유저가 존재하지만 비밀번호가 틀린 경우 null 반환', async () => {
      // GIVEN
      const studentNumber = 12345678;
      const pass = 'password';
      const user = new UserModel();
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
      // WHEN
      const result = await authService.validateUser(studentNumber, pass);
      // THEN
      expect(result).toBeNull();
    });
  });
  describe('genUserToken 테스트', () => {
    test('genUserToken 성공', async () => {
      // GIVEN
      const user = {
        studentNumber: 12345678,
        id: 1,
      };
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';
      jest
        .spyOn(authService as any, 'genAccessToken')
        .mockResolvedValue('accessToken');
      jest
        .spyOn(authService as any, 'genRefreshToken')
        .mockResolvedValue('refreshToken');
      // WHEN
      const reuslt = await authService.genUserToken(user);
      // THEN
      expect(reuslt).toEqual({
        accessToken,
        refreshToken,
      });
    });
  });

  describe('changeNormalUserToStaff 테스트', () => {
    test('userId에 해당하는 유저가 존재하지 않는 경우 NotFoundException 반환', async () => {
      // GIVEN
      const userId = 1;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(authService.changeNormalUserToStaff(userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(authService.changeNormalUserToStaff(userId)).rejects.toThrow(
        '존재하지 않는 유저입니다.',
      );
    });

    test('이미 staff인 경우 BadRequestException 반환', async () => {
      // GIVEN
      const userId = 1;
      const user = new UserModel();
      user.isStaff = true;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      // WHEN
      // THEN
      await expect(authService.changeNormalUserToStaff(userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(authService.changeNormalUserToStaff(userId)).rejects.toThrow(
        '이미 staff입니다.',
      );
    });

    test('권한 변경 성공', async () => {
      // GIVEN
      const userId = 1;
      const user = new UserModel();
      user.isStaff = false;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      // WHEN
      const result = await authService.changeNormalUserToStaff(userId);
      // THEN
      expect(result).toEqual('권한 변경 성공');
    });
  });

  describe('findMyPassword 테스트', () => {
    test('studentNumber에 해당하는 유저가 존재하지 않는 경우 NotFoundException 반환', async () => {
      // GIVEN
      const studentNumber = 12345678;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(authService.findMyPassword(studentNumber)).rejects.toThrow(
        NotFoundException,
      );
      await expect(authService.findMyPassword(studentNumber)).rejects.toThrow(
        '존재하지 않는 유저입니다.',
      );
    });

    test('인증번호 전송 성공', async () => {
      // GIVEN
      const studentNumber = 12345678;
      const user = new UserModel();
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(authService as any, 'createVerificationCodeAndSend')
        .mockResolvedValue('인증번호 전송 성공');
      // WHEN
      const result = await authService.findMyPassword(studentNumber);
      // THEN
      expect(result).toEqual('인증번호 전송 성공');
    });
  });

  describe('generateNewPassword 테스트', () => {
    test('studentNumber에 해당하는 유저가 존재하지 않는 경우 BadRequestException 반환', async () => {
      // GIVEN
      const studentNumber = 12345678;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(
        authService.generateNewPassword(studentNumber),
      ).rejects.toThrow(BadRequestException);
      await expect(
        authService.generateNewPassword(studentNumber),
      ).rejects.toThrow('존재하지 않는 유저입니다.');
    });

    test('인증번호 전송 성공', async () => {
      // GIVEN
      const studentNumber = 12345678;
      const user = new UserModel();
      const newPassword = 'newPassword';
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(authService as any, 'createVerificationCodeAndSend')
        .mockResolvedValue('인증번호 전송 성공');
      jest.spyOn(String.prototype, 'padStart').mockReturnValue(newPassword);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      // WHEN
      const result = await authService.generateNewPassword(studentNumber);
      // THEN
      expect(result).toEqual(newPassword);
    });
  });

  describe('rotateToken 테스트', () => {
    test('accessToken 반환', async () => {
      // GIVEN
      const userId = 1;
      const user = new UserModel();
      user.id = userId;
      const rawToken = 'rawToken';
      const newAccessToken = 'newAccessToken';
      jest.spyOn(authService as any, 'getInfosInToken').mockResolvedValue(user);
      jest
        .spyOn(authService as any, 'genAccessToken')
        .mockResolvedValue(newAccessToken);
      // WHEN
      const result = await authService.rotateToken(rawToken);
      // THEN
      expect(result).toEqual({
        accessToken: newAccessToken,
      });
    });
  });

  describe('getInfosInToken 테스트', () => {
    test('getInfosInToken 시 오류 발생하면 UnauthorizedException 반환', async () => {
      // GIVEN
      const rawToken = 'rawToken';
      jest.spyOn(jwtService as any, 'verify').mockRejectedValue(new Error());
      // WHEN
      // THEN
      await expect(authService.getInfosInToken(rawToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    test('getInfosInToken 성공', async () => {
      // GIVEN
      const rawToken = 'rawToken';
      const user = new UserModel();
      jest.spyOn(jwtService as any, 'verify').mockResolvedValue(user);

      // WHEN
      const result = await authService.getInfosInToken(rawToken);

      // THEN
      expect(result).toEqual(user);
    });
  });

  describe('getTokenExpiresTime 테스트', () => {
    test('토큰 만료 시간 반환', async () => {
      // GIVEN
      const token = 'token';
      jest.spyOn(jwtService as any, 'verifyAsync').mockResolvedValue({
        iat: 1,
        exp: 2,
      });
      // WHEN
      const result = await authService.getTokenExpiresTime(token);
      // THEN
      expect(result).toEqual(1);
    });
  });

  describe('isSamePassword 테스트', () => {
    test('id에 해당하는 유저가 존재하지 않는 경우 NotFoundException 반환', async () => {
      // GIVEN
      const id = 1;
      const password = 'password';
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(
        (authService as any).isSamePassword(id, password),
      ).rejects.toThrow(NotFoundException);
      await expect(
        (authService as any).isSamePassword(id, password),
      ).rejects.toThrow('존재하지 않는 유저입니다.');
    });

    test('isSamePassword 성공', async () => {
      // GIVEN
      const id = 1;
      const password = 'password';
      const user = new UserModel();
      user.password = 'password';
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      // WHEN
      const result = await (authService as any).isSamePassword(id, password);
      // THEN
      expect(result).toBeTruthy();
    });
  });

  describe('genAccessToken 테스트', () => {
    test('genAccessToken 성공', async () => {
      // GIVEN
      const user = {
        studentNumber: 12345678,
        id: 1,
      };
      const accessToken = 'accessToken';
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('accessToken');
      jest.spyOn(configService, 'get').mockReturnValue('1');
      // WHEN
      const result = await (authService as any).genAccessToken(user);
      // THEN
      expect(result).toEqual(accessToken);
    });
  });

  describe('genRefreshToken 테스트', () => {
    test('genRefreshToken 성공', async () => {
      // GIVEN
      const user = {
        studentNumber: 12345678,
        id: 1,
      };
      const refreshToken = 'refreshToken';
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('refreshToken');
      jest.spyOn(configService, 'get').mockReturnValue('1');
      // WHEN
      const result = await (authService as any).genRefreshToken(user);
      // THEN
      expect(result).toEqual(refreshToken);
    });
  });

  describe('findByStudentNumber 테스트', () => {
    test('studentNumber에 해당하는 유저가 있는지 반환 - 있는 경우 true', async () => {
      // GIVEN
      const studentNumber = 12345678;
      jest.spyOn(userRepository, 'existsBy').mockResolvedValue(true);
      // WHEN
      const result = await (authService as any).findByStudentNumber(
        studentNumber,
      );
      // THEN
      expect(result).toBeTruthy();
    });

    test('studentNumber에 해당하는 유저가 있는지 반환 - 없는 경우 false', async () => {
      // GIVEN
      const studentNumber = 12345678;
      jest.spyOn(userRepository, 'existsBy').mockResolvedValue(false);
      // WHEN
      const result = await (authService as any).findByStudentNumber(
        studentNumber,
      );
      // THEN
      expect(result).toBeFalsy();
    });
  });

  describe('genereateVerificationCode 테스트', () => {
    test('6자리의 인증코드 반환', () => {
      // GIVEN
      jest.spyOn(String.prototype, 'padStart').mockReturnValue('123456');
      // WHEN
      const result = (authService as any).generateVerifcationCode();
      // THEN
      expect(result).toEqual('123456');
    });
  });
});
