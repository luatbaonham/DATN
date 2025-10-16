import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateExamSlotDto {
  @ApiProperty({ description: 'ID đợt thi' })
  @IsInt()
  examSessionId!: number;

  @ApiProperty({ description: 'Tên ca thi', example: 'Ca sáng' })
  @IsString()
  @IsNotEmpty()
  slotName!: string;

  @ApiProperty({ description: 'Giờ bắt đầu (HH:MM)', example: '08:00' })
  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @ApiProperty({ description: 'Giờ kết thúc (HH:MM)', example: '10:00' })
  @IsString()
  @IsNotEmpty()
  endTime!: string;

  @ApiProperty({ required: false, description: 'Mô tả ca thi' })
  @IsOptional()
  @IsString()
  description?: string;
}
