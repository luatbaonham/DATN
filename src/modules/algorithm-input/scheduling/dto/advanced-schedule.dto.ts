// ./dto/advanced-schedule.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsBoolean,
  IsOptional,
  Min,
  IsDateString, // <-- THÊM MỚI
} from 'class-validator';

// ----------------------------------------------------------------
// (Không thay đổi các DTO con: ExamGroupDto, RoomDto, ProctorDto, StudentDto, ConstraintsDto)
// ----------------------------------------------------------------

export class ExamGroupDto {
  @ApiProperty({
    description: 'ID duy nhất cho nhóm thi (ví dụ: "GT1-G1")',
    example: 'GT1-G1',
  })
  @IsString()
  @IsNotEmpty()
  examGroupId!: string;

  @ApiProperty({
    description: 'Mã môn học gốc (ví dụ: "GT1")',
    example: 'GT1',
  })
  @IsString()
  @IsNotEmpty()
  courseCode!: string;

  @ApiProperty({
    description: 'Số lượng sinh viên trong nhóm thi này',
    example: 80,
  })
  @IsInt()
  @Min(1)
  studentCount!: number;

  @ApiProperty({
    description: 'Thời lượng thi của môn này (phút)',
    example: 90,
  })
  @IsInt()
  @Min(30)
  duration!: number;
}

export class RoomDto {
  @ApiProperty({ example: 'P101' })
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiProperty({ example: 'D9' })
  @IsString()
  @IsNotEmpty()
  location!: string;
}

export class ProctorDto {
  @ApiProperty({ example: 'GV001' })
  @IsString()
  @IsNotEmpty()
  proctorId!: string;
}

export class StudentDto {
  @ApiProperty({ example: 'SV001' })
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty({
    description: 'Danh sách các ID nhóm thi mà sinh viên này tham gia',
    example: ['GT1-G1', 'VL1-G3'],
  })
  @IsArray()
  @IsString({ each: true })
  examGroups!: string[];
}

export class ConstraintsDto {
  @ApiProperty({
    description: 'Số ca thi tối đa mỗi ngày cho 1 sinh viên',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxExamsPerStudentPerDay?: number;

  @ApiProperty({
    description:
      'Tránh việc sinh viên phải di chuyển giữa các địa điểm trong 1 ngày',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  avoidInterLocationTravel?: boolean;
}

// ----------------------------------------------------------------
// THAY ĐỔI LỚN: Cập nhật DTO chính
// ----------------------------------------------------------------
export class AdvancedScheduleDto {
  @ApiProperty({
    description: 'Ngày bắt đầu kỳ thi (định dạng YYYY-MM-DD)',
    example: '2025-05-01',
  })
  @IsDateString()
  startDate!: string; // <-- THÊM MỚI

  @ApiProperty({
    description: 'Ngày kết thúc kỳ thi (định dạng YYYY-MM-DD)',
    example: '2025-06-30',
  })
  @IsDateString()
  endDate!: string; // <-- THÊM MỚI

  @ApiProperty({
    description: 'Danh sách các ngày lễ cần loại bỏ (định dạng YYYY-MM-DD)',
    example: ['2025-05-01', '2025-05-15'],
  })
  @IsArray()
  @IsDateString({}, { each: true })
  holidays!: string[]; // <-- THÊM MỚI

  @ApiProperty({ type: [ExamGroupDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamGroupDto)
  examGroups!: ExamGroupDto[];

  @ApiProperty({ type: [RoomDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomDto)
  rooms!: RoomDto[];

  @ApiProperty({ type: [ProctorDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProctorDto)
  proctors!: ProctorDto[];

  @ApiProperty({ type: [StudentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentDto)
  students!: StudentDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConstraintsDto)
  constraints?: ConstraintsDto;
}
