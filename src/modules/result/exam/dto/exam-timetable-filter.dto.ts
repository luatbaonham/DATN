import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ExamTimetableFilterDto {
  @ApiPropertyOptional({
    description: 'Ngày bắt đầu (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc (YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'ID của exam session',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  examSessionId?: number;
}
