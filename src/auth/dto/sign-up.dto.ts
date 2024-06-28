import { UserModel } from 'src/user/entities/user.entity';
import { PickType } from '@nestjs/mapped-types';

export class SignUpDto extends PickType(UserModel, [
  'name',
  'gender',
  'major',
  'student_number',
  'birth',
  'phone',
]) {}
