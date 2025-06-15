import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { SignupForm } from '@todo-app/libs'
export class SignupDto implements SignupForm {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(6)
  // @Matches(/^(?:password)$/, { message: 'Passwords do not match' })
  passwordConfirm: string;
} 