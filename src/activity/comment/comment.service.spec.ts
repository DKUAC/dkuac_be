import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { ActivityService } from '../activity.service';
import { DeleteResult, Repository } from 'typeorm';
import { CommentModel } from './entities/comment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ActivityModel } from '../entities/activity.entity';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserModel } from 'src/user/entities/user.entity';

describe('CommentService', () => {
  let commentService: CommentService;
  let acitivityService: ActivityService;
  let commentRepository: Repository<CommentModel>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: ActivityService,
          useValue: {
            getActivityComments: jest.fn(),
            getActivityById: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CommentModel),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    commentService = module.get<CommentService>(CommentService);
    acitivityService = module.get<ActivityService>(ActivityService);
    commentRepository = module.get<Repository<CommentModel>>(
      getRepositoryToken(CommentModel),
    );
  });

  it('should be defined', () => {
    expect(commentService).toBeDefined();
  });

  describe('getComments 테스트', () => {
    test('입력으로 받은 activityId에 해당하는 게시물의 댓글 반환', async () => {
      // GIVEN
      const activityId = 1;
      const comments = [new CommentModel()];

      jest
        .spyOn(acitivityService, 'getActivityComments')
        .mockResolvedValue(comments);
      // WHEN
      const result = await commentService.getComments(activityId);
      // THEN
      expect(result).toEqual(comments);
    });
  });

  describe('postComment 테스트', () => {
    test('dto 속 content가 없는 경우 , BadRequestException 반환', async () => {
      // GIVEN
      const activityId = 1;
      const userId = 1;
      const dto = new CreateCommentDto();
      const activity = new ActivityModel();
      jest
        .spyOn(acitivityService, 'getActivityById')
        .mockResolvedValue(activity);
      // WHEN
      // THEN
      await expect(
        commentService.postComment(activityId, userId, dto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        commentService.postComment(activityId, userId, dto),
      ).rejects.toThrow('내용을 입력해주세요.');
    });

    test('댓글 생성 중 알 수 없는 에러 발생 시, BadRequestException 반환', async () => {
      // GIVEN
      const activityId = 1;
      const userId = 1;
      const dto = new CreateCommentDto();
      dto.content = 'content';
      const activity = new ActivityModel();
      jest
        .spyOn(acitivityService, 'getActivityById')
        .mockResolvedValue(activity);
      jest.spyOn(commentRepository, 'save').mockRejectedValue(new Error());
      // WHEN
      // THEN
      await expect(
        commentService.postComment(activityId, userId, dto),
      ).rejects.toThrow(BadRequestException);
    });

    test('댓글 생성 완료', async () => {
      // GIVEN
      const activityId = 1;
      const userId = 1;
      const dto = new CreateCommentDto();
      dto.content = 'content';
      const activity = new ActivityModel();
      const comment = new CommentModel();
      jest
        .spyOn(acitivityService, 'getActivityById')
        .mockResolvedValue(activity);
      jest.spyOn(commentRepository, 'save').mockResolvedValue(comment);
      // WHEN
      const result = await commentService.postComment(activityId, userId, dto);
      // THEN
      expect(result).toEqual({
        message: '댓글이 작성되었습니다.',
      });
    });
  });

  describe('putComment 테스트', () => {
    test('dto에 content가 없는 경우 BadRequestException 반환', async () => {
      // GIVEN
      const commentId = 1;
      const userId = 1;
      const dto = new UpdateCommentDto();
      // WHEN
      // THEN
      await expect(
        commentService.putComment(commentId, userId, dto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        commentService.putComment(commentId, userId, dto),
      ).rejects.toThrow('내용을 입력해주세요.');
    });

    test('입력으로 받은 commentId에 해당하는 댓글이 없는 경우 NotFoundException 반환', async () => {
      // GIVEN
      const commentId = 1;
      const userId = 1;
      const dto = new UpdateCommentDto();
      dto.content = 'content';
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(
        commentService.putComment(commentId, userId, dto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        commentService.putComment(commentId, userId, dto),
      ).rejects.toThrow('존재하지 않는 댓글입니다.');
    });

    test('댓글을 수정하려는 유저와 댓글 작성자가 다른 경우 UnauthorizedException 반환', async () => {
      // GIVEN
      const commentId = 1;
      const userId = 1;
      const user = new UserModel();
      user.id = 2;
      const dto = new UpdateCommentDto();
      dto.content = 'content';
      const comment = new CommentModel();
      comment.Author = user;
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(comment);
      // WHEN
      // THEN
      await expect(
        commentService.putComment(commentId, userId, dto),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        commentService.putComment(commentId, userId, dto),
      ).rejects.toThrow('작성자만 수정할 수 있습니다.');
    });

    test('댓글 수정 중 알 수 없는 에러 발생 시, BadRequestException 반환', async () => {
      // GIVEN
      const commentId = 1;
      const userId = 1;
      const user = new UserModel();
      user.id = 1;
      const dto = new UpdateCommentDto();
      dto.content = 'content';
      const comment = new CommentModel();
      comment.Author = user;
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(comment);
      jest.spyOn(commentRepository, 'save').mockRejectedValue(new Error());
      // WHEN
      // THEN
      await expect(
        commentService.putComment(commentId, userId, dto),
      ).rejects.toThrow(BadRequestException);
    });

    test('댓글 수정 완료', async () => {
      // GIVEN
      const commentId = 1;
      const userId = 1;
      const user = new UserModel();
      user.id = 1;
      const dto = new UpdateCommentDto();
      dto.content = 'content';
      const comment = new CommentModel();
      comment.Author = user;
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(comment);
      jest.spyOn(commentRepository, 'save').mockResolvedValue(comment);
      // WHEN
      const result = await commentService.putComment(commentId, userId, dto);
      // THEN
      expect(result).toEqual({
        message: '댓글이 수정되었습니다.',
      });
    });
  });

  describe('deleteComment 테스트', () => {
    test('입력으로 받은 commentId에 해당하는 댓글이 없는 경우 NotFoundException 반환', async () => {
      // GIVEN
      const commentId = 1;
      const userId = 1;
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(null);
      // WHEN
      // THEN
      await expect(
        commentService.deleteComment(commentId, userId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        commentService.deleteComment(commentId, userId),
      ).rejects.toThrow('존재하지 않는 댓글입니다.');
    });

    test('댓글을 삭제하려는 유저와 댓글 작성자가 다른 경우 UnauthorizedException 반환', async () => {
      // GIVEN
      const commentId = 1;
      const userId = 1;
      const user = new UserModel();
      user.id = 2;
      const comment = new CommentModel();
      comment.Author = user;
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(comment);
      // WHEN
      // THEN
      await expect(
        commentService.deleteComment(commentId, userId),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        commentService.deleteComment(commentId, userId),
      ).rejects.toThrow('작성자만 삭제할 수 있습니다.');
    });

    test('댓글 삭제 중 알 수 없는 에러 발생 시, BadRequestException 반환', async () => {
      // GIVEN
      const commentId = 1;
      const userId = 1;
      const user = new UserModel();
      user.id = 1;
      const comment = new CommentModel();
      comment.Author = user;
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(comment);
      jest.spyOn(commentRepository, 'delete').mockRejectedValue(new Error());
      // WHEN
      // THEN
      await expect(
        commentService.deleteComment(commentId, userId),
      ).rejects.toThrow(BadRequestException);
    });

    test('댓글 삭제 완료', async () => {
      // GIVEN
      const commentId = 1;
      const userId = 1;
      const user = new UserModel();
      user.id = 1;
      const comment = new CommentModel();
      comment.Author = user;
      const deleteResult = new DeleteResult();
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(comment);
      jest.spyOn(commentRepository, 'delete').mockResolvedValue(deleteResult);
      // WHEN
      const result = await commentService.deleteComment(commentId, userId);
      // THEN
      expect(result).toEqual({
        message: '댓글이 삭제되었습니다.',
      });
    });
  });
});
