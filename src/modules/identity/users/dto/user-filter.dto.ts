import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserFilterDto {
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
    description: 'Họ tên người dùng cần tìm',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    required: false,
    description: 'Email cần tìm',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    required: false,
    description: 'Tên role cần tìm',
  })
  @IsOptional()
  @IsString()
  role?: string;
}
