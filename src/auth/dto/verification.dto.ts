import { IsNumber, IsString } from 'class-validator';

export class VerificationDto {
  @IsNumber()
  studentNumber: number;

  @IsString()
  codeFromUser: string;
}
