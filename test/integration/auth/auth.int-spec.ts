import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommentModel } from 'src/activity/comment/entities/comment.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { SignUpDto } from 'src/auth/dto/auth.dto';
import { EmailService } from 'src/email/email.service';
import { UserModel } from 'src/auth/user/entities/user.entity';
import { getTestMySQLTypeOrmModule } from 'test/getTestMySQLTypeOrmModule';
import { DataSource, Repository } from 'typeorm';

describe('AuthService (Integration))', () => {
  let authService: AuthService;
  let userRepository: Repository<UserModel>;
  let dataSource: DataSource;
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.register({}),
        CacheModule.register(),
        getTestMySQLTypeOrmModule(),
      ],
      providers: [
        ConfigService,
        JwtService,
        EmailService,
        {
          provide: CACHE_MANAGER,
          useValue: {},
        },
      ],
    }).compile();

    userRepository = module.get(getRepositoryToken(UserModel));
    dataSource = module.get<DataSource>(DataSource);
    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await userRepository.clear();
    await dataSource.getRepository(CommentModel).clear();
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
  });

  describe('create user', () => {
    it('회원가입 성공 시 유저 반환', async () => {
      const dto = new SignUpDto();
      dto.name = 'test';
      dto.phone = '01012341234';
      dto.studentNumber = 12341234;
      dto.major = '컴퓨터공학과';
      dto.birth = new Date('1998-03-02');
      const res = await authService.signUp(dto);
      expect(res).toHaveProperty('id');
      expect(res).toHaveProperty(
        'name',
        dto.name + '|' + String(dto.phone.slice(7)),
      );
      expect(res).toHaveProperty('phone', dto.phone);
      expect(res).toHaveProperty('studentNumber', dto.studentNumber);
      expect(res).toHaveProperty('major', dto.major);
      expect(res).toHaveProperty('birth', dto.birth);
    });
  });

  describe('login', () => {
    it('로그인 성공 시 유저 반환', async () => {
      const dto = new SignUpDto();
      dto.name = 'test';
      dto.phone = '01012341234';
      dto.studentNumber = 12341234;
      dto.major = '컴퓨터공학과';
      dto.birth = new Date('1998-03-02');
      const user = await authService.signUp(dto);
      const res = await authService.logIn({
        studentNumber: dto.studentNumber,
        password: dto.phone.slice(3),
      });
      expect(res).toHaveProperty('user');
      expect(res).toHaveProperty('accessToken');
      expect(res).toHaveProperty('refreshToken');
    });
  });
});
