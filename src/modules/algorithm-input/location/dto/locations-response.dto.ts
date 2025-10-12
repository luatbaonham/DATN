import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class LocationResponseDto {
  @ApiProperty({
    description: 'ID của cơ sở',
    example: 1,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Mã cơ sở (duy nhất)',
    example: 'CS001',
  })
  @Expose()
  code!: string;

  @ApiProperty({
    description: 'Tên cơ sở',
    example: 'Cơ sở Nguyễn Văn Bảo',
  })
  @Expose()
  name!: string;

  @ApiProperty({
    description: 'Địa chỉ cơ sở',
    example: '180 Nguyễn Văn Bảo, Gò Vấp, TP.HCM',
  })
  @Expose()
  address!: string;

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
