import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsString,
  Matches,
  IsDateString,
  ValidateIf,
} from 'class-validator';
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

  @ApiProperty({
    required: false,
    description: 'Ngày bắt đầu (YYYY-MM-DD)',
    example: '2025-11-06',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDate phải có định dạng YYYY-MM-DD',
  })
  @IsDateString(
    {},
    {
      message: 'startDate phải là ngày hợp lệ',
    },
  )
  startDate?: string;

  @ApiProperty({
    required: false,
    description: 'Ngày kết thúc (YYYY-MM-DD)',
    example: '2025-11-06',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'endDate phải có định dạng YYYY-MM-DD',
  })
  @IsDateString(
    {},
    {
      message: 'endDate phải là ngày hợp lệ',
    },
  )
  @ValidateIf((o) => !!o.startDate, {
    message: 'endDate không được trước startDate',
  })
  endDate?: string;

  @ApiProperty({
    required: false,
    description: 'ID của đợt thi (Exam Session)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  examSessionId?: number;
}
