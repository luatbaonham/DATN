// student-filter.dto.ts
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CourseFilterDto {
  @ApiProperty({ required: false, description: 'Trang hiện tại' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({
    required: false,
    description: 'Số lượng mỗi trang',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({
    required: false,
    description: 'Mã môn học cần tìm',
  })
  @IsOptional()
  @IsString()
  codeCourse?: string;

  @ApiProperty({
    required: false,
    description: 'Tên môn học cần tìm',
  })
  @IsOptional()
  @IsString()
  nameCourse?: string;

  @ApiProperty({ required: false, description: 'Số tín chỉ cần lọc' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  credits?: number;
}
