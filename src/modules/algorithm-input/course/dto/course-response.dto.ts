// course-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CourseResponseDto {
  @ApiProperty({ description: 'ID môn học', example: 1 })
  @Expose()
  id!: number;

  @ApiProperty({ description: 'Mã môn học', example: 'CS101' })
  @Expose()
  codeCourse!: string;

  @ApiProperty({ description: 'Tên môn học', example: 'Nhập môn Lập trình' })
  @Expose()
  nameCourse!: string;

  @ApiProperty({
    description: 'Mô tả môn học',
    example: 'Học các khái niệm cơ bản về lập trình',
    required: false,
  })
  @Expose()
  description?: string;

  @ApiProperty({ description: 'Số tín chỉ', example: 3, default: 3 })
  @Expose()
  credits!: number;

  @ApiProperty({
    description: 'Số sinh viên dự kiến đăng ký',
    example: 50,
    default: 0,
  })
  @Expose()
  expected_students!: number;

  @ApiProperty({
    description: 'Trạng thái môn học (đang mở / đã khóa)',
    example: true,
    default: true,
  })
  @Expose()
  is_active!: boolean;

  @ApiProperty({
    description: 'Ngày tạo bản ghi',
    example: '2025-09-29T08:00:00.000Z',
  })
  @Expose()
  createAt?: Date;

  @ApiProperty({
    description: 'Ngày cập nhật bản ghi',
    example: '2025-09-29T08:00:00.000Z',
  })
  @Expose()
  updateAt?: Date;
}
