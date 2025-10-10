import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RoomFilterDto {
  @ApiProperty({ required: false, description: 'Trang hiện tại' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({
    required: false,
    description: 'Số lượng mỗi trang',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({
    required: false,
    description: 'Mã phòng cần tìm',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    required: false,
    description: 'Tên địa điểm cần lọc',
  })
  @IsOptional()
  @IsString()
  locationName?: string;

  @ApiProperty({
    required: false,
    description: 'Sức chứa tối thiểu',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  capacity_min?: number;

  @ApiProperty({
    required: false,
    description: 'Sức chứa tối đa',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  capacity_max?: number;
}
