import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SuggestionService } from './suggestion.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('suggestion')
export class SuggestionController {
  constructor(private readonly suggestionService: SuggestionService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getSuggestions(@Req() req) {
    const { sub } = req.user;
    return this.suggestionService.getSuggestions(sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async postSuggestion(@Req() req, @Body('content') content: string) {
    const { sub } = req.user;
    return this.suggestionService.postSuggestion(sub, content);
  }
}
