import { UserModel } from 'src/user/entities/user.entity';
import { PickType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class SignUpDto extends PickType(UserModel, [
  'name',
  'major',
  'studentNumber',
  'birth',
  'phone',
]) {
  @ApiProperty({
    description: '유저 이름',
    default: '홍길동',
  })
  name: string;

  @ApiProperty({
    description: '전공',
    default: '컴퓨터공학',
  })
  major: string;

  @ApiProperty({
    description: `학번
    - 아이디로 쓰일 예정
    - 중복 불가능
    - 숫자만 입력 가능(8자리)
    `,
    default: 32184045,
  })
  studentNumber: number;

  @ApiProperty({
    description: '생년월일',
    default: '1998-03-02',
  })
  birth: Date;

  @ApiProperty({
    description: `전화번호, 초기 비밀번호로 쓰일 예정(e.g. 01012345678 -> 12345678(기본 비밀번호))`,
    default: '01012345678',
  })
  phone: string;
}

export class LogInDto extends PickType(UserModel, [
  'studentNumber',
  'password',
]) {
  @ApiProperty({
    description: '학번',
    default: 32184045,
  })
  studentNumber: number;

  @ApiProperty({
    description: '비밀번호',
    default: '12345678',
  })
  password: string;
}

export class CreateVerificationCodeDto {
  @ApiProperty({
    description: '학번',
    default: 32184045,
  })
  @IsNumber()
  studentNumber: number;
}

export class IsVerifiedDto {
  @ApiProperty({
    description: '학번',
    default: 32184045,
  })
  @IsNumber()
  studentNumber: number;

  @ApiProperty({
    description: '사용자가 입력한 인증번호',
    default: '123456',
  })
  @IsString()
  codeFromUser: string;
}

export class PasswordCheckDto {
  @ApiProperty({
    description: '비밀번호',
    default: '12345678',
  })
  @IsString()
  password: string;
}
export class PasswordChangeDto {
  @ApiProperty({
    description: '기존 비밀번호',
    default: '12345678',
  })
  @IsString()
  newPassword: string;
}
