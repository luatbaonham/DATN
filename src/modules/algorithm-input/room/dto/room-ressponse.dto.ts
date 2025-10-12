import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RoomResponseDto {
  @ApiProperty({ description: 'ID phòng học', example: 1 })
  @Expose()
  id!: number;

  @ApiProperty({ description: 'Mã phòng', example: 'P101' })
  @Expose()
  code!: string;

  @ApiProperty({ description: 'Sức chứa sinh viên', example: 60 })
  @Expose()
  capacity!: number;

  @ApiProperty({ description: 'Địa điểm', example: 'CS1 - Hà Nội' })
  @Expose()
  location?: string;

  @ApiProperty({ description: 'Loại phòng', example: 'LT' })
  @Expose()
  type!: string;

  @ApiProperty({ description: 'Phòng khả dụng hay không', example: true })
  @Expose()
  is_active!: boolean;

  @ApiProperty({
    description: 'Ngày tạo bản ghi',
    example: '2025-10-01T08:00:00.000Z',
  })
  @Expose()
  createdAt?: Date;

  @ApiProperty({
    description: 'Ngày cập nhật bản ghi',
    example: '2025-10-01T08:00:00.000Z',
  })
  @Expose()
  updatedAt!: Date;
}
