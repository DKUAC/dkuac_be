import { Test, TestingModule } from '@nestjs/testing';
import { SuggestionController } from './suggestion.controller';
import { SuggestionService } from './suggestion.service';
import { SuggestionModel } from './entities/suggestion.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { SuggestionDto } from './dto/suggestion.dto';

describe('SuggestionController', () => {
  let controller: SuggestionController;
  let suggestionService: SuggestionService;
  let mockReturn = new SuggestionModel();
  let mockRequest: any;
  beforeEach(async () => {
    jest.resetAllMocks();
    mockRequest = {
      user: {
        sub: 1,
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuggestionController],
      providers: [
        {
          provide: SuggestionService,
          useValue: {
            getSuggestions: jest.fn((sub) => []),
            postSuggestion: jest.fn((sub, dto) => Promise.resolve(mockReturn)),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActiate: (context: ExecutionContext) => true,
      })
      .compile();

    controller = module.get<SuggestionController>(SuggestionController);
    suggestionService = module.get<SuggestionService>(SuggestionService);
  });

  test('건의 사항 조회 테스트', async () => {
    // GIVEN

    // WHEN
    const result = await controller.getSuggestions(mockRequest);
    // THEN
    expect(suggestionService.getSuggestions).toHaveBeenCalledWith(1);
    expect(suggestionService.getSuggestions).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  test('건의사항 등록하기 테스트', async () => {
    // GIVEN
    const dto = new SuggestionDto();
    // WHEN
    const result = await controller.postSuggestion(mockRequest, dto);
    // THEN
    expect(suggestionService.postSuggestion).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual(mockReturn);
  });
});
