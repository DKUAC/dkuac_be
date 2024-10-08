import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('/activity/:activityId/comments')
@Controller('activity/:activityId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiOperation({
    summary: '특정 활동의 댓글 조회',
  })
  @Get()
  async getComments(@Param('activityId', ParseIntPipe) activityId: number) {
    return await this.commentService.getComments(activityId);
  }

  @ApiOperation({
    summary: '특정 활동의 댓글 작성',
  })
  @Post()
  @UseGuards(JwtAuthGuard)
  async postComment(
    @Param('activityId', ParseIntPipe) activityId: number,
    @Req() req,
    @Body() dto: CreateCommentDto,
  ) {
    const { sub } = req.user;
    return await this.commentService.postComment(activityId, sub, dto);
  }

  @ApiOperation({
    summary: '특정 활동글의 댓글 수정',
  })
  @Put(':commentId')
  @UseGuards(JwtAuthGuard)
  async putComment(
    @Param('commentId') commentId: number,
    @Req() req,
    @Body() dto: UpdateCommentDto,
  ) {
    const { sub } = req.user;
    return await this.commentService.putComment(commentId, sub, dto);
  }

  @ApiOperation({
    summary: '특정 활동글의 댓글 삭제',
  })
  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  async deleteComment(@Param('commentId') commentId: number, @Req() req) {
    const { sub } = req.user;
    return await this.commentService.deleteComment(+commentId, sub);
  }
}
