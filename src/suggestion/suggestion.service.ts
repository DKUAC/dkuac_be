import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SuggestionModel } from './entities/suggestion.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/auth/user/user.service';
import { SuggestionDto } from './dto/suggestion.dto';
import { UserModel } from 'src/auth/user/entities/user.entity';

@Injectable()
export class SuggestionService {
  constructor(
    @InjectRepository(SuggestionModel)
    private readonly suggestionRepository: Repository<SuggestionModel>,
    private readonly userService: UserService,
  ) {}

  async getSuggestions(userId: number) {
    const user = await this.userService.findUserById(userId);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (user.isStaff === false) {
      throw new UnauthorizedException('임원진만 건의사항을 볼 수 있습니다.');
    }

    const suggestions = await this.suggestionRepository.find();
    return suggestions;
  }

  async postSuggestion(userId: number, dto: SuggestionDto) {
    const { content } = dto;
    const user = await this.userService.findUserById(userId);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (user.currentSemesterMember === false) {
      throw new UnauthorizedException(
        '현재 학기 회원만 건의사항을 올릴 수 있습니다.',
      );
    }
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const semester = month >= 3 && month <= 8 ? 1 : 2;

    const suggestion = this.suggestionRepository.create({
      content,
      year,
      semester,
      date,
      User: user,
    });
    const result = await this.suggestionRepository.save(suggestion);
    return result;
  }
}
