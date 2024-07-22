import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('CommentController', () => {
  let controller: CommentController;
  let commentService: CommentService;
  let mockRequest: {
    user: {
      sub: number;
    };
  };
  let mockReturn: string = 'mock return';
  let activityId: number;
  let commentId: number;
  beforeEach(async () => {
    mockRequest = {
      user: {
        sub: 1,
      },
    };
    activityId = 1;
    commentId = 1;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: {
            getComments: jest.fn((activityId: number) => mockReturn),
            postComment: jest.fn(
              (activityId: number, userId: number, dto: CreateCommentDto) =>
                mockReturn,
            ),
            putComment: jest.fn(
              (commentId: number, userId: number, dto: UpdateCommentDto) =>
                mockReturn,
            ),
            deleteComment: jest.fn(
              (commentId: number, userId: number) => mockReturn,
            ),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => true,
      })
      .compile();

    controller = module.get<CommentController>(CommentController);
    commentService = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  test('activityId를 파라미터로 넘겨줬을 때 활동 글의 댓글을 가져올 수 있는지 테스트', async () => {
    // GIVEN
    // WHEN
    const result = await controller.getComments(activityId);
    // THEN
    expect(commentService.getComments).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockReturn);
  });

  test('특정 활동에 댓글 다는 컨트롤러 테스트', async () => {
    // GIVEN
    const dto = new CreateCommentDto();
    // WHEN
    const result = await controller.postComment(activityId, mockRequest, dto);
    // THEN
    expect(commentService.postComment).toHaveBeenCalledTimes(1);
    expect(commentService.postComment).toHaveBeenCalledWith(1, 1, dto);
    expect(result).toEqual(mockReturn);
  });

  test('특정 활동 게시글의 댓글 수정 컨트롤러 테스트', async () => {
    // GIVEN
    const dto = new UpdateCommentDto();
    // WHEN
    const result = await controller.putComment(commentId, mockRequest, dto);
    // THEN
    expect(commentService.putComment).toHaveBeenCalledTimes(1);
    expect(commentService.putComment).toHaveBeenCalledWith(1, 1, dto);
    expect(result).toEqual(mockReturn);
  });

  test('특정 활동글의 댓글을 삭제하는 테스트', async () => {
    // GIVEN
    // WHEN
    const result = await controller.deleteComment(commentId, mockRequest);
    // THEN
    expect(commentService.deleteComment).toHaveBeenCalledTimes(1);
    expect(commentService.deleteComment).toHaveBeenCalledWith(1, 1);
    expect(result).toEqual(mockReturn);
  });
});
