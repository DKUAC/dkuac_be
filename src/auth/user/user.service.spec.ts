import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { UserModel } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<UserModel>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserModel),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<UserModel>>(
      getRepositoryToken(UserModel),
    );
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  test('입력으로 받은 id에 해당하는 유저 찾기', async () => {
    // GIVEN
    const id = 1;
    const mockUser = new UserModel();
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
    // WHEN
    const result = await userService.findUserById(id);
    // THEN
    expect(result).toEqual(mockUser);
  });
});
