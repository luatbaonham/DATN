import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

@Exclude()
export class AcademicYearResponseDto {
  @ApiProperty({
    description: 'Tên niên khóa',
    example: '2025-2026',
  })
  @Expose()
  name!: string;

  @Expose()
  @ApiProperty({ description: 'Ngày bắt đầu', example: '2025-06-01T08:00:00Z' })
  startDate!: Date;

  @Expose()
  @ApiProperty({
    description: 'Ngày kết thúc',
    example: '2025-06-15T17:00:00Z',
  })
  endDate!: Date;

  @ApiProperty({
    description: 'Thời điểm tạo',
    example: '2025-10-04T23:35:00.000Z',
    readOnly: true,
  })
  @Expose()
  createdAt?: Date;

  @ApiProperty({
    description: 'Thời điểm cập nhật',
    example: '2025-10-04T23:36:00.000Z',
    readOnly: true,
  })
  @Expose()
  updatedAt?: Date;
}
