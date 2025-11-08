import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsDateString,
  ValidateNested,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  IsObject,
  IsString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ConstraintCode {
  HOLIDAY = 'HOLIDAY',
  AVOID_WEEKEND = 'AVOID_WEEKEND',
  MAX_EXAMS_PER_DAY = 'MAX_EXAMS_PER_DAY',
  ROOM_LOCATION_LIMIT = 'ROOM_LOCATION_LIMIT',
}

// -----------------------------
// ⚙️ DTO con: Constraint
// -----------------------------
export class ConstraintsRuleDto {
  @ApiProperty({ enum: ConstraintCode, example: ConstraintCode.HOLIDAY })
  @IsEnum(ConstraintCode, {
    message: 'constraintCode không hợp lệ',
  })
  constraintCode!: ConstraintCode;

  @ApiProperty({
    example: { holiday: ['2025-10-20'] },
    description: 'Chi tiết rule, dạng JSON, mỗi constraint có format khác nhau',
  })
  @IsObject()
  rule!: Record<string, any>; // nội dung rule FE nhập
}

// -----------------------------
// ⚙️ DTO con: Room
// -----------------------------
export class RoomDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id!: number;

  @ApiProperty({ example: 60 })
  @IsNumber()
  capacity!: number;

  @ApiProperty({
    example: 2,
    description: 'ID của địa điểm hoặc khu vực của phòng',
  })
  @IsNumber()
  locationId!: number; // ✅ đổi từ object sang số
}

// -----------------------------
// ⚙️ DTO con: Lecturer
// -----------------------------
export class LecturerDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id!: number;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  name!: string;
}

// -----------------------------
// ⚙️ DTO chính: ScheduleRequestDto
// -----------------------------
export class ScheduleRequestDto {
  @ApiProperty({
    description: 'Danh sách phòng thi (FE gửi chi tiết)',
    type: [RoomDto], // ✅ thêm dòng này
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomDto)
  @IsNotEmpty()
  rooms!: RoomDto[];

  @ApiProperty({
    description: 'Danh sách giảng viên (FE gửi chi tiết)',
    type: [LecturerDto], // ✅ thêm dòng này
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LecturerDto)
  @IsNotEmpty()
  lecturers!: LecturerDto[];

  @ApiProperty({ description: 'ID của đợt thi (ExamSession)' })
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

  @ApiProperty({
    required: false,
    type: [ConstraintsRuleDto], // ✅ thêm luôn để Swagger hiểu
  })
  @ValidateNested({ each: true })
  @Type(() => ConstraintsRuleDto)
  @IsOptional()
  constraints?: ConstraintsRuleDto[];
}
