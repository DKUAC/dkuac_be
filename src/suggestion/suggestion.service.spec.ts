import { Test, TestingModule } from '@nestjs/testing';
import { SuggestionService } from './suggestion.service';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { SuggestionModel } from './entities/suggestion.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserModel } from 'src/user/entities/user.entity';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SuggestionDto } from './dto/suggestion.dto';

describe('SuggestionService', () => {
  let suggestionService: SuggestionService;
  let userService: UserService;
  let suggestionRepository: Repository<SuggestionModel>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuggestionService,
        {
          provide: UserService,
          useValue: {
            findUserById: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SuggestionModel),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    suggestionService = module.get<SuggestionService>(SuggestionService);
    userService = module.get<UserService>(UserService);
    suggestionRepository = module.get<Repository<SuggestionModel>>(
      getRepositoryToken(SuggestionModel),
    );
  });

  it('should be defined', () => {
    expect(suggestionService).toBeDefined();
  });

  describe('getSuggestions 테스트', () => {
    test('입력으로 받은 userId에 해당하는 유저가 존재하지 않는 경우 NotFoundException 반환', async () => {
      // GIVEN
      const userId = 1;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(suggestionService.getSuggestions(userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(suggestionService.getSuggestions(userId)).rejects.toThrow(
        '사용자를 찾을 수 없습니다.',
      );
    });
    test('입력으로 받은 userId에 해당하는 유저가 staff가 아닌 경우 UnauthorizedException 반환', async () => {
      // GIVEN
      const userId = 1;
      const mockUser = new UserModel();
      mockUser.isStaff = false;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser);
      // WHEN
      // THEN
      await expect(suggestionService.getSuggestions(userId)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(suggestionService.getSuggestions(userId)).rejects.toThrow(
        '임원진만 건의사항을 볼 수 있습니다.',
      );
    });

    test('건의사항 불러오기 성공', async () => {
      // GIVEN
      const userId = 1;
      const mockUser = new UserModel();
      const suggestion1 = new SuggestionModel();
      const suggestion2 = new SuggestionModel();
      const mockReturn = [suggestion1, suggestion2];
      mockUser.isStaff = true;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser);
      jest.spyOn(suggestionRepository, 'find').mockResolvedValue(mockReturn);
      // WHEN
      const result = await suggestionService.getSuggestions(userId);
      // THEN
      expect(result).toEqual(mockReturn);
    });
  });
  describe('postSuggestion 테스트', () => {
    test('입력으로 받은 userId에 해당하는 유저가 존재하지 않는 경우 NotFoundException 반환', async () => {
      // GIVEN
      const userId = 1;
      const dto = new SuggestionDto();
      jest.spyOn(userService, 'findUserById').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(
        suggestionService.postSuggestion(userId, dto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        suggestionService.postSuggestion(userId, dto),
      ).rejects.toThrow('사용자를 찾을 수 없습니다.');
    });

    test('입력으로 받은 userId에 해당하는 유저가 현재 학기 회원이 아닌 경우 건의사항 제출 불가 - UnauthorizedException 반환', async () => {
      // GIVEN
      const userId = 1;
      const dto = new SuggestionDto();
      const mockUser = new UserModel();
      mockUser.currentSemesterMember = false;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser);
      // WHEN
      // THEN
      await expect(
        suggestionService.postSuggestion(userId, dto),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        suggestionService.postSuggestion(userId, dto),
      ).rejects.toThrow('현재 학기 회원만 건의사항을 올릴 수 있습니다.');
    });

    test('건의사항 제출 성공', async () => {
      // GIVEN
      const userId = 1;
      const dto = new SuggestionDto();
      const mockUser = new UserModel();
      const mockSuggestionModel = new SuggestionModel();
      mockUser.currentSemesterMember = true;
      dto.content = 'test content';
      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser);
      jest
        .spyOn(suggestionRepository, 'create')
        .mockReturnValue(mockSuggestionModel);
      jest
        .spyOn(suggestionRepository, 'save')
        .mockResolvedValue(mockSuggestionModel);
      // WHEN
      const result = await suggestionService.postSuggestion(userId, dto);
      // THEN
      expect(result).toEqual(mockSuggestionModel);
    });
  });
});
