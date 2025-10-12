// create-lecturer.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsInt,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLecturerDto {
  @ApiProperty({
    description: 'Mã giảng viên',
    example: 'GV001',
  })
  @IsString({ message: 'Mã giảng viên phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã giảng viên không được để trống' })
  lecturerCode!: string;

  @ApiProperty({
    description: 'Họ của giảng viên',
    example: 'Nguyễn Đình',
  })
  @IsString({ message: 'Họ phải là chuỗi' })
  @IsNotEmpty({ message: 'Họ không được để trống' })
  firstName!: string;

  @ApiProperty({
    description: 'Tên của giảng viên',
    example: 'Luật',
  })
  @IsString({ message: 'Tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  lastName!: string;

  @ApiProperty({
    description: 'Ngày sinh (yyyy-mm-dd)',
    example: '2002-05-20',
  })
  @IsDateString({}, { message: 'dateOfBirth phải là ngày hợp lệ' })
  dateOfBirth!: Date;

  @ApiProperty({
    description: 'Giới tính của giảng viên',
    example: 'male',
  })
  @IsString({ message: 'gender phải là chuỗi' })
  gender!: string;

  @ApiProperty({
    description: 'Địa chỉ giảng viên (tùy chọn)',
    example: '123 Đường ABC, Hà Nội',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Số điện thoại (tùy chọn)',
    example: '0912345678',
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Có phải là giám thị không',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isSupervisor phải là kiểu boolean' })
  isSupervisor?: boolean;

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
