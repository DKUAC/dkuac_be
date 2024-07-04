import { Module } from '@nestjs/common';
import { SuggestionService } from './suggestion.service';
import { SuggestionController } from './suggestion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuggestionModel } from './entities/suggestion.entity';
import { UserModel } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([SuggestionModel, UserModel]), UserModule],
  controllers: [SuggestionController],
  providers: [SuggestionService],
})
export class SuggestionModule {}
