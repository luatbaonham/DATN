// student-filter.dto.ts
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DepartmentFilterDto {
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
    description: 'Mã Khoa cần tìm',
  })
  @IsOptional()
  @IsString()
  departmentCode?: string;

  @ApiProperty({
    required: false,
    description: 'Tên Khoa cần tìm',
  })
  @IsOptional()
  @IsString()
  departmentName?: string;
}
