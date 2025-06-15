import { IsEmail, IsString, MinLength } from 'class-validator';
import { LoginForm } from '@todo-app/libs';
export class LoginDto implements LoginForm {
  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  email: string;

  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  password: string;
}
