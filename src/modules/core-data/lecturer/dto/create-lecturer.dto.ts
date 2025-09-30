// create-lecturer.dto.ts
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
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
  @IsNumber({}, { message: 'ID người dùng phải là số' })
  @IsNotEmpty({ message: 'ID người dùng không được để trống' })
  userId!: number;

  @ApiProperty({
    description: 'ID khoa',
    example: 1,
  })
  @IsNumber({}, { message: 'ID khoa phải là số' })
  @IsNotEmpty({ message: 'ID khoa không được để trống' })
  departmentId!: number;
}
