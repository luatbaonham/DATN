import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ExamSessionResponseDto {
  @ApiProperty({ description: 'ID đợt thi', example: 1 })
  @Expose()
  id!: number;

  @ApiProperty({ description: 'Tên đợt thi', example: 'Học kỳ 1 - 2025' })
  @Expose()
  name!: string;

  @ApiProperty({ description: 'Ngày bắt đầu', example: '2025-06-01T08:00:00Z' })
  @Expose()
  start_date!: Date;

  @ApiProperty({
    description: 'Ngày kết thúc',
    example: '2025-06-15T17:00:00Z',
  })
  @Expose()
  end_date!: Date;

  @ApiProperty({
    description: 'Trạng thái đợt thi (đang mở hay không)',
    example: true,
  })
  @Expose()
  is_active!: boolean;

  @ApiProperty({
    description: 'Mô tả đợt thi',
    example: 'Đợt thi cuối kỳ học kỳ 1 năm học 2024-2025',
    required: false,
  })
  @Expose()
  description?: string;

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
