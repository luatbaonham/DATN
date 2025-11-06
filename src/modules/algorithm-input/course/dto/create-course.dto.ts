import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Mã môn học là duy nhất',
    example: 'INT1104',
  })
  @IsString({ message: 'Mã môn học phải là chuỗi' })
  @Length(3, 10, { message: 'Mã phải từ 3 đến 10 kí tự' })
  codeCourse!: string;

  @ApiProperty({
    description: 'Tên môn học',
    example: 'Nhập môn trí tuệ nhân tạo',
  })
  @IsString({ message: 'Tên môn học phải là chuỗi' })
  nameCourse!: string;

  @ApiProperty({
    description: 'Mô tả môn học (tùy chọn)',
    example: 'Môn học giới thiệu các khái niệm cơ bản về AI',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @ApiProperty({
    description: 'Số tín chỉ',
    example: 3,
    default: 3,
  })
  @IsInt({ message: 'Số tín chỉ phải là số nguyên' })
  @Min(1, { message: 'Số tín chỉ phải lớn hơn 0' })
  credits!: number;

  @ApiProperty({
    description: 'Thời lượng thi môn này(phút)',
    example: 90,
  })
  @IsInt({ message: 'Thời lượng thi phải là số nguyên' })
  duration_course_exam!: number;

  @ApiProperty({
    description: 'Số sinh viên dự kiến đăng ký',
    example: 50,
    default: 0,
  })
  @IsInt({ message: 'Số sinh viên phải là số nguyên' })
  @Min(0, { message: 'Số sinh viên không được âm' })
  expected_students!: number;

  @ApiProperty({
    description: 'Trạng thái môn học (đang mở hoặc khóa)',
    example: true,
    default: true,
  })
  @IsBoolean({ message: 'Trạng thái phải là true hoặc false' })
  is_active!: boolean;
}
