import { IsOptional, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FindTodosDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(12)
  month?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(2000)
  @Max(2100)
  year?: number;
} 