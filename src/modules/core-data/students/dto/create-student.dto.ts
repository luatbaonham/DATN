import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsDateString,
  IsOptional,
  Length,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({
    description: 'Mã sinh viên duy nhất',
    example: 'SV001',
  })
  @IsString({ message: 'studentCode phải là chuỗi' })
  @Length(3, 20, { message: 'studentCode từ 3-20 ký tự' })
  studentCode!: string;

  @ApiProperty({
    description: 'Ngày sinh (yyyy-mm-dd)',
    example: '2002-05-20',
  })
  @IsDateString({}, { message: 'dateOfBirth phải là ngày hợp lệ' })
  dateOfBirth!: Date;

  @ApiProperty({
    description: 'Giới tính của sinh viên',
    example: 'male',
  })
  @IsString({ message: 'gender phải là chuỗi' })
  gender!: string;

  @ApiProperty({
    description: 'Địa chỉ sinh viên (tùy chọn)',
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
}
