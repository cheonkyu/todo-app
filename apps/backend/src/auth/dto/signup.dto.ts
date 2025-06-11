import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class SignupDto {
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