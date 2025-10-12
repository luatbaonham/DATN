import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class LecturerFilterDto {
  @ApiProperty({ required: false, description: 'Trang hiện tại' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ required: false, description: 'Số lượng mỗi trang' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({
    required: false,
    description: 'Mã giảng viên cần tìm',
  })
  @IsOptional()
  @IsString()
  lecturerCode?: string;

  // @ApiProperty({ required: false, description: 'ID Khoa cần lọc' })
  // @IsOptional()
  // @Type(() => Number)
  // @IsNumber()
  // departmentId?: number;

  @ApiProperty({
    required: false,
    description: 'Giới tính cần lọc',
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({
    required: false,
    description: 'Họ tên giảng viên cần tìm',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    required: false,
    description: 'Email giảng viên cần tìm',
  })
  @IsOptional()
  @IsString()
  email?: string;
}
