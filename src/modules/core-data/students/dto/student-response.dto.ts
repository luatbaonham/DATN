// student-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class StudentResponseDto {
  @ApiProperty({ description: 'ID sinh viên', example: 1 })
  @Expose()
  id!: number;

  @ApiProperty({ description: 'Mã sinh viên', example: 'SV001' })
  @Expose()
  studentCode!: string;

  @ApiProperty({ description: 'Họ sinh viên', example: 'Nguyễn' })
  @Expose()
  firstName!: string;

  @ApiProperty({ description: 'Tên sinh viên', example: 'An' })
  @Expose()
  lastName!: string;

  @ApiProperty({
    description: 'Email sinh viên',
    example: 'an.nguyen@example.com',
  })
  @Expose()
  email!: string;

  @ApiProperty({ description: 'Ngày sinh', example: '2002-05-20' })
  @Expose()
  dateOfBirth!: Date;

  @ApiProperty({ description: 'Giới tính', example: 'male' })
  @Expose()
  gender!: string;

  @ApiProperty({
    description: 'Địa chỉ',
    example: '123 Đường ABC, Hà Nội',
    required: false,
  })
  @Expose()
  address?: string;

  @ApiProperty({
    description: 'Số điện thoại',
    example: '0912345678',
    required: false,
  })
  @Expose()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Ngày tạo bản ghi',
    example: '2025-09-29T08:00:00.000Z',
  })
  @Expose()
  createdAt?: Date;

  @ApiProperty({
    description: 'Ngày cập nhật bản ghi',
    example: '2025-09-29T08:00:00.000Z',
  })
  @Expose()
  updatedAt?: Date;
}
