import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateExamDto {
  @ApiProperty({ description: 'Ngày thi', example: '2025-10-25' })
  @IsDateString(
    {},
    { message: 'Ngày thi phải là định dạng ngày hợp lệ (YYYY-MM-DD)' },
  )
  examDate!: Date;

  @ApiProperty({ description: 'ID đợt thi', example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'ID đợt thi phải là số nguyên' })
  examSessionId!: number;

  @ApiProperty({ description: 'ID phòng thi', example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'ID phòng thi phải là số nguyên' })
  roomId!: number;

  @ApiProperty({ description: 'ID ca thi', example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'ID ca thi phải là số nguyên' })
  examSlotId!: number;

  @ApiProperty({ description: 'ID nhóm thi', example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'ID nhóm thi phải là số nguyên' })
  examGroupId!: number;

  @ApiProperty({ description: 'Thời gian thi (phút)', example: 120 })
  @Type(() => Number)
  @IsInt({ message: 'Thời gian thi phải là số nguyên' })
  @Min(1, { message: 'Thời gian thi phải lớn hơn 0 phút' })
  duration!: number;

  @ApiProperty({
    description: 'Trạng thái kỳ thi (ví dụ: "draft", "final")',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Trạng thái thi phải là chuỗi' })
  status?: string;
}
