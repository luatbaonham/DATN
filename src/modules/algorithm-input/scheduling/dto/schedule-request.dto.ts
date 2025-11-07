import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsDateString,
  ValidateNested,
  IsOptional,
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

// -----------------------------
// ⚙️ DTO con: Constraint
// -----------------------------
export class ConstraintsRuleDto {
  @ApiProperty({ example: 24 })
  @IsInt()
  constraintId!: number; // ID của constraint trong DB

  @ApiProperty({
    example: { holiday: ['2025-10-20'] },
    description: 'Chi tiết rule, dạng JSON, mỗi constraint có format khác nhau',
  })
  @IsObject()
  rule!: Record<string, any>; // nội dung rule FE nhập
}

// -----------------------------
// ⚙️ DTO chính: ScheduleRequestDto
// -----------------------------
export class ScheduleRequestDto {
  @ApiProperty({ description: 'Danh sách ID của các phòng thi hợp lệ' })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  roomIds!: number[];

  @ApiProperty({
    description: 'Danh sách ID của các giảng viên (giám thị) hợp lệ',
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  lecturerIds!: number[];

  @ApiProperty({ description: 'ID của đợt thi (ExamSession) để lọc nhóm thi' })
  @IsNumber()
  @IsNotEmpty()
  examSessionId!: number;

  @ApiProperty({ example: '2025-10-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @ApiProperty({ example: '2025-10-15' })
  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @ApiProperty({ required: false, type: [ConstraintsRuleDto] })
  @ValidateNested({ each: true })
  @Type(() => ConstraintsRuleDto)
  @IsOptional()
  constraints?: ConstraintsRuleDto[];
}
