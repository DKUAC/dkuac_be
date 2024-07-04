import { UserModel } from 'src/user/entities/user.entity';
import { PickType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto extends PickType(UserModel, [
  'name',
  'major',
  'student_number',
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
  student_number: number;

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
  'student_number',
  'password',
]) {
  @ApiProperty({
    description: '학번',
    default: 32184045,
  })
  student_number: number;

  @ApiProperty({
    description: '비밀번호',
    default: '12345678',
  })
  password: string;
}
