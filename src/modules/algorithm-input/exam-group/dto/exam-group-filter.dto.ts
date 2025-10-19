import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsNumber } from 'class-validator';

export class ExamGroupFilterDto {
  @ApiProperty({ required: false, description: 'Trang hiện tại' })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ required: false, description: 'Số lượng mỗi trang' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}
