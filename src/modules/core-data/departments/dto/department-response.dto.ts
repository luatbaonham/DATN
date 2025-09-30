import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class DepartmentResponseDto {
  @ApiProperty({ example: 1, description: 'ID phòng khoa' })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'CNTT', description: 'Mã khoa' })
  @Expose()
  departmentCode!: string;

  @ApiProperty({ example: 'Công Nghệ Thông Tin', description: 'Tên khoa' })
  @Expose()
  departmentName!: string;

  @ApiProperty({
    example: '2025-09-28T14:15:00.000Z',
    description: 'Ngày tạo',
  })
  @Expose()
  createdAt?: Date;

  @ApiProperty({
    example: '2025-09-28T14:20:30.000Z',
    description: 'Ngày cập nhật',
  })
  @Expose()
  updatedAt?: Date;
}
