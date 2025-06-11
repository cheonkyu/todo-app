import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsDateString()
  @IsOptional()
  date?: string;
} 