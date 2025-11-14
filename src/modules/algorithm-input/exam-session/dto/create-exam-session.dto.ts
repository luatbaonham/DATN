import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateExamSessionDto {
  @ApiProperty({ description: 'Tên đợt thi', example: 'Học kỳ 1 - 2025' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Ngày bắt đầu', example: '2025-06-01T08:00:00Z' })
  @IsDateString()
  start_date?: Date;

  @ApiProperty({
    description: 'Ngày kết thúc',
    example: '2025-06-15T17:00:00Z',
  })
  @IsDateString()
  end_date?: Date;

  @ApiProperty({
    description: 'Trạng thái đợt thi',
    example: true,
    default: true,
  })
  @IsBoolean()
  is_active!: boolean;

  @ApiProperty({
    description: 'Mô tả đợt thi',
    example: 'Đợt thi cuối kỳ học kỳ 1 năm học 2024-2025',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Id niên khóa của đợt thi',
    example: 1,
  })
  @IsInt()
  academic_year_id!: number;

  @ApiProperty({
    description: 'ID địa điểm tổ chức thi',
    example: 1,
  })
  @IsInt()
  location_id!: number;
}
