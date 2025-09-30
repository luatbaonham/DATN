// update-lecturer.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateLecturerDto {
  @IsOptional()
  @ApiProperty({ example: 'GV001', description: 'Mã giảng viên' })
  @IsString({ message: 'Mã giảng viên phải là chuỗi' })
  code?: string;

  @IsOptional()
  @ApiProperty({ example: 1, description: 'ID người dùng' })
  @IsNumber({}, { message: 'ID người dùng phải là số' })
  userId?: number;

  @IsOptional()
  @ApiProperty({ example: 1, description: 'ID khoa' })
  @IsNumber({}, { message: 'ID khoa phải là số' })
  departmentId?: number;
}
