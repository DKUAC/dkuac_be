import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import {
  ChangeUserToStaffDto,
  CreateVerificationCodeDto,
  FindMyPasswordDto,
  GenerateNewPasswordDto,
  IsVerifiedDto,
  PasswordChangeDto,
  PasswordCheckDto,
  SignUpDto,
} from './dto/auth.dto';
import { UserModel } from 'src/user/entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

type CustomResponse = Partial<Response> & {
  cookie: jest.Mock;
  clearCookie: jest.Mock;
  json: jest.Mock;
  status: jest.Mock<any, any> & ((statusCode: number) => CustomResponse);
  send: jest.Mock;
};

describe('AuthController Unit Test', () => {
  let controller: AuthController;
  let authService: AuthService;
  let mockRequest: any;
  let mockResponse: CustomResponse;
  let mockSignUpDto: SignUpDto;

  beforeEach(async () => {
    jest.resetAllMocks();
    mockRequest = {
      user: {
        refreshToken: 'test-refresh-token',
        accessToken: 'test-access-token',
      },
      cookies: {
        refreshToken: 'test-refresh-token',
      },
    };

    mockResponse = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      json: jest.fn().mockReturnValue({}),
      status: jest
        .fn()
        .mockImplementation((statusCode: number) => mockResponse),
      send: jest.fn().mockReturnValue(mockResponse),
    } as CustomResponse;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        // NestJS에서 서비스, 레포지토리, 팩토리 등 DI를 위한 설정을 정의하는 배열. 이 배열에 포함된 각 항목은 NestJS DI 시스템에 의해 처리됨.
        {
          provide: AuthService,
          useValue: {
            getTokenExpiresTime: jest.fn().mockReturnValue(3600), // getTokenExpiresTime 메서드가 항상 3600을 반환하도록 모킹된 AuthService 제공
            signUp: jest.fn().mockImplementation((mockSignUpDto) => {}),
            createVerificationCodeAndSend: jest.fn((studentNumber) => {
              return '메시지 전송';
            }),
            isVerified: jest.fn((studentNumber, codeFromUser) => {
              return true;
            }),
            passwordCheck: jest.fn((sub, password) => {
              return true;
            }),
            passwordChange: jest.fn((sub, newPassword) => Promise.resolve()),
            changeNormalUserToStaff: jest.fn((userId) => '권한 변경 성공'),
            findMyPassword: jest.fn((studentNumber) => '인증번호 전송 성공'),
            generateNewPassword: jest.fn((studentNumber) => Promise.resolve()),
            rotateToken: jest.fn((refreshToken) => {
              return {
                accessToken: 'new-access-token',
              };
            }),
          },
        },
      ],
    })
      .overrideGuard(LocalAuthGuard) // 테스트 모듈 내에 LocalAuthGuard를 모킹한 구현으로 재정의
      .useValue({
        // 가드의 모킹 구현 지정 , useValue에 전달된 객체는 가드의 모킹 버전 제공
        canActiate: (context: ExecutionContext) => true, // canActivate는 가드 인터페이스에서 라우터 핸들러가 실행될지 여부를 결정함. 이를 true로 설정해 테스트 중 가드의 인증 체크를 우회함.
      })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActiate: (context: ExecutionContext) => true,
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('Post login', () => {
    it('GIVEN valid credentials WHEN login is called THEN it should set the refresh token cookie and return user data with expiration time', async () => {
      // GIVEN
      const expectedExpirationDate = new Date();
      expectedExpirationDate.setSeconds(
        expectedExpirationDate.getSeconds() + 3600,
      );

      jest
        .spyOn(authService, 'getTokenExpiresTime')
        .mockResolvedValueOnce(3600);

      // WHEN
      await controller.login(mockRequest as Request, mockResponse as any);

      // THEN
      expect(authService.getTokenExpiresTime).toHaveBeenCalledWith(
        'test-refresh-token',
      );
      expect(authService.getTokenExpiresTime).toHaveBeenCalledWith(
        'test-access-token',
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'test-refresh-token',
        {
          httpOnly: true,
          maxAge: 3600 * 1000,
        },
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        accessToken: 'test-access-token',
        expiredTime: expectedExpirationDate,
      });
    });
  });

  describe('Post logout', () => {
    it('GIVEN logout request with post method WHEN logout is called THEN it should remove refreshToken cookie in browser', async () => {
      // GIVEN
      // WHEN
      await controller.logout(mockResponse as any);

      // THEN
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(await controller.logout(mockResponse as any)).toEqual({
        message: '로그아웃 되었습니다.',
      });
    });
  });

  describe('Post signup', () => {
    it('GIVEN Body in SignUpDto WHEN signup is called THEN it should save user info in DB and return reuslt with status code 201', async () => {
      // GIVEN
      const mockReturnUser = new UserModel();
      jest.spyOn(authService, 'signUp').mockResolvedValueOnce(mockReturnUser);
      // WHEN
      await controller.signUp(mockSignUpDto, mockResponse as any);
      // THEN
      expect(authService.signUp).toHaveBeenCalledWith(mockSignUpDto);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalledWith(mockReturnUser);
    });
  });

  describe('Post create-verification-code', () => {
    it('GIVEN dto typed CreateVerificationCodeDto and reseponse WHEN createVerificationCode is called THEN return result with status code 201 ', async () => {
      // GIVEN
      const mockDto = new CreateVerificationCodeDto();

      // WHEN
      await controller.createVerificationCode(mockDto, mockResponse as any);

      // THEN
      expect(authService.createVerificationCodeAndSend).toHaveBeenCalledWith(
        mockDto.studentNumber,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalledWith('메시지 전송');
    });
  });

  describe('Post is-verified', () => {
    it('사용자로부터 입력받은 인증번호가 우리가 전송한 인증번호와 일치하는지 확인', async () => {
      // GIVEN
      const mockDto = new IsVerifiedDto();

      // WHEN
      await controller.isVerified(mockDto, mockResponse as any);

      // THEN
      expect(authService.isVerified).toHaveBeenCalledWith(
        mockDto.studentNumber,
        mockDto.codeFromUser,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(true);
    });
  });

  describe('Post password-check', () => {
    test('사용자가 입력한 아이디 비밀번호가 실제 비밀번호와 일치하는 경우', async () => {
      // GIVEN
      const mockDto = new PasswordCheckDto();
      mockDto.password = 'test-pw';
      mockRequest.user.sub = 1;

      // WHEN
      const result = await controller.passwordCheck(mockRequest, mockDto);

      // THEN
      expect(authService.passwordCheck).toHaveBeenCalledWith(1, 'test-pw');
      expect(result).toEqual({
        statusCode: 200,
      });
    });
  });

  test('사용자가 입력한 비밀번호가 실제 비밀번호와 일치하지 않는 경우', async () => {
    // GIVEN
    const mockDto = new PasswordCheckDto();
    mockDto.password = 'test-pw';
    mockRequest.user.sub = 1;
    jest.spyOn(authService, 'passwordCheck').mockResolvedValue(false);
    // WHEN
    await controller.passwordCheck(mockRequest, mockDto);

    // THEN
    expect(authService.passwordCheck).toHaveBeenCalledWith(1, 'test-pw');
    expect(await controller.passwordCheck(mockRequest, mockDto)).toEqual(
      '비밀번호가 일치하지 않습니다.',
    );
  });

  describe('Post password-change', () => {
    test('비밀번호 변경 테스트', async () => {
      // GIVEN
      const mockDto = new PasswordChangeDto();
      mockRequest.user.sub = 1;
      mockDto.newPassword = 'test new pw';
      // WHEN
      const result = await controller.passwordChange(mockRequest, mockDto);
      // THEN
      expect(authService.passwordChange).toHaveBeenCalledWith(1, 'test new pw');
      expect(result).toEqual({
        statusCode: 200,
        message: '비밀번호가 변경되었습니다.',
      });
    });
  });

  describe('Post change-normal-user-to-staff', () => {
    test('일반 사용자를 스태프로 변경하는 테스트', async () => {
      // GIVEN
      const mockDto = new ChangeUserToStaffDto();
      mockDto.userId = 1;
      // WHEN
      const result = await controller.changeNormalUserToStaff(mockDto);
      // THEN
      expect(authService.changeNormalUserToStaff).toHaveBeenCalledWith(1);
      expect(result).toBe('권한 변경 성공');
    });
  });

  describe('Post find-my-password', () => {
    test('비밀번호 찾기 테스트', async () => {
      // GIVEN
      const mockDto = new FindMyPasswordDto();
      mockDto.studentNumber = 1;

      // WHEN
      const result = await controller.findMyPassword(mockDto);
      // THEN
      expect(authService.findMyPassword).toHaveBeenCalledWith(1);
      expect(result).toEqual('인증번호 전송 성공');
    });
  });

  describe('Post generate-new-password 테스트', () => {
    test('새 비밀번호 생성 컨트롤러 테스트', async () => {
      // GIVEN
      const mockDto = new GenerateNewPasswordDto();
      mockDto.studentNumber = 1;
      jest
        .spyOn(authService, 'generateNewPassword')
        .mockResolvedValue('new password');

      // WHEN
      const result = await controller.generateNewPassword(mockDto);

      // THEN

      expect(authService.generateNewPassword).toHaveBeenCalledWith(1);
      expect(result).toEqual('new password');
    });
  });

  describe('Get token/access 엔드포인트 테스트', () => {
    test('토큰 재발급 테스트', async () => {
      // GIVEN
      // WHEN
      const result = await controller.getAccessToken(mockRequest);
      // THEN
      expect(authService.rotateToken).toHaveBeenCalledWith(
        'test-refresh-token',
      );
      expect(result).toEqual({
        accessToken: 'new-access-token',
      });
    });
  });

  describe('Get is-token-expired 엔드포인트 테스트', () => {
    test('토큰이 만료됐는지 확인하는 테스트', async () => {
      // GIVEN
      // WHEN
      const result = await controller.checkTokenExpired(mockRequest);
      // THEN
      expect(result).toEqual(true);
    });
  });
});
