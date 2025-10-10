// student-filter.dto.ts
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class StudentFilterDto {
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
    description: 'Mã sinh viên cần tìm',
  })
  @IsOptional()
  @IsString()
  studentCode?: string;

  @ApiProperty({
    required: false,
    description: 'Giới tính cần lọc',
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ required: false, description: 'ID lớp cần lọc' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  classId?: number;

  @ApiProperty({
    required: false,
    description: 'Họ tên sinh viên cần tìm',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    required: false,
    description: 'Email sinh viên cần tìm',
  })
  @IsOptional()
  @IsString()
  email?: string;
}
