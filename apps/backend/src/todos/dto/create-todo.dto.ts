import { Todo } from '@todo-app/libs';
import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateTodoDto implements Omit<Todo, 'id'> {
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