import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { SignUpDto } from './dto/auth.dto';
import { UserModel } from 'src/user/entities/user.entity';

type CustomResponse = Partial<Response> & {
  cookie: jest.Mock;
  clearCookie: jest.Mock;
  json: jest.Mock;
  status: jest.Mock<any, any> & ((statusCode: number) => CustomResponse);
  send: jest.Mock;
};

describe('AuthController', () => {
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
          },
        },
      ],
    })
      .overrideGuard(LocalAuthGuard) // 테스트 모듈 내에 LocalAuthGuard를 모킹한 구현으로 재정의
      .useValue({
        // 가드의 모킹 구현 지정 , useValue에 전달된 객체는 가드의 모킹 버전 제공
        canActiate: (context: ExecutionContext) => true, // canActivate는 가드 인터페이스에서 라우터 핸들러가 실행될지 여부를 결정함. 이를 true로 설정해 테스트 중 가드의 인증 체크를 우회함.
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
});
