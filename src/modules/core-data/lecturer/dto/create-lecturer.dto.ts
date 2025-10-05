// create-lecturer.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLecturerDto {
  @ApiProperty({
    description: 'Mã giảng viên',
    example: 'GV001',
  })
  @IsString({ message: 'Mã giảng viên phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã giảng viên không được để trống' })
  code!: string;

  @ApiProperty({
    description: 'ID người dùng',
    example: 1,
  })
  @IsOptional()
  userId?: number;

  @ApiProperty({
    description: 'ID khoa',
    example: 1,
  })
  @IsInt({ message: 'ID khoa phải là số nguyên' })
  @IsNotEmpty({ message: 'ID khoa không được để trống' })
  departmentId!: number;
}
