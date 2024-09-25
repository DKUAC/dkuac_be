import { UserModel } from 'src/auth/user/entities/user.entity';
import { PickType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsIn, IsNumber, IsString } from 'class-validator';

export class SignUpDto extends PickType(UserModel, [
  'name',
  'major',
  'studentNumber',
  'birth',
  'phone',
  'email',
]) {
  @ApiProperty({
    description: '유저 이름',
    default: '홍길동',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '유저 메일',
    default: 'abcdefg@dankook.ac.kr',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: '전공',
    default: '컴퓨터공학',
  })
  @IsString()
  major: string;

  @ApiProperty({
    description: `학번
    - 아이디로 쓰일 예정
    - 중복 불가능
    - 숫자만 입력 가능(8자리)
    `,
    default: 32184045,
  })
  @IsNumber()
  studentNumber: number;

  @ApiProperty({
    description: '생년월일',
    default: '1998-03-02',
  })
  @IsDate()
  birth: Date;

  @ApiProperty({
    description: `전화번호, 초기 비밀번호로 쓰일 예정(e.g. 01012345678 -> 12345678(기본 비밀번호))`,
    default: '01012345678',
  })
  @IsString()
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
  @IsNumber()
  studentNumber: number;

  @ApiProperty({
    description: '비밀번호',
    default: '12345678',
  })
  @IsString()
  password: string;
}

export class CreateVerificationCodeDto {
  @ApiProperty({
    description: '가입시 사용한 이메일',
    default: '32184045@dankook.ac.kr',
  })
  @IsString()
  email: string;
}

export class IsVerifiedDto {
  @ApiProperty({
    description: '가입 시 사용한 이메일',
    default: '32184045@dankook.ac.kr',
  })
  @IsString()
  email: string;

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

export class ChangeUserToStaffDto {
  @ApiProperty({
    description: '유저 id',
    default: 1,
  })
  @IsNumber()
  userId: number;
}

export class FindMyPasswordDto {
  @ApiProperty({
    description: '가입 시 사용한 이메일',
    default: '32184045@dankook.ac.kr',
  })
  @IsString()
  email: string;
}

export class GenerateNewPasswordDto {
  @ApiProperty({
    description: '가입 시 사용한 이메일',
    default: '32184045@dankook.ac.kr',
  })
  @IsString()
  email: string;
}
