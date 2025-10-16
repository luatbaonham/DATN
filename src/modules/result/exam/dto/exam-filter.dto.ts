import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ExamFilterDto {
  @ApiProperty({ required: false, description: 'Trang hiện tại' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ required: false, description: 'Số lượng mỗi trang' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({
    required: false,
    description: 'Trạng thái kỳ thi',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    required: false,
    description: 'Tên nhóm thi cần tìm (ExamGroup)',
  })
  @IsOptional()
  @IsString()
  examGroupName?: string;

  @ApiProperty({ required: false, description: 'Tên phòng thi cần tìm' })
  @IsOptional()
  @IsString()
  roomName?: string;
}
