import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SuggestionService } from './suggestion.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuggestionDto } from './dto/suggestion.dto';

@ApiTags('suggestion')
@Controller('suggestion')
export class SuggestionController {
  constructor(private readonly suggestionService: SuggestionService) {}

  @ApiOperation({
    summary: '건의사항 조회',
  })
  @Get()
  @UseGuards(JwtAuthGuard)
  async getSuggestions(@Req() req) {
    const { sub } = req.user;
    return this.suggestionService.getSuggestions(sub);
  }

  @ApiOperation({
    summary: '건의사항 등록',
  })
  @Post()
  @UseGuards(JwtAuthGuard)
  async postSuggestion(@Req() req, @Body() dto: SuggestionDto) {
    const { sub } = req.user;
    console.log('건의사항 등록');
    console.log(sub);
    const result = await this.suggestionService.postSuggestion(sub, dto);
    return result;
  }
}
