// src/scheduling/dto/advanced-schedule.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsString,
  ValidateNested,
  ArrayMinSize,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';

// --- Các thành phần của Input ---

// Thêm "export" ở đây
export class StudentDto {
  @ApiProperty()
  @IsString()
  studentId!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  subjects!: string[];
}

// Thêm "export" ở đây
export class SubjectDto {
  @ApiProperty()
  @IsString()
  subjectId!: string;

  @ApiProperty({ description: 'Thời gian thi tính bằng phút' })
  @IsInt()
  @Min(15)
  duration!: number;
}

// Thêm "export" ở đây
export class RoomDto {
  @ApiProperty()
  @IsString()
  roomId!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiProperty()
  @IsString()
  location!: string;
}

// Thêm "export" ở đây
export class ProctorDto {
  @ApiProperty()
  @IsString()
  proctorId!: string;
}

// Thêm "export" ở đây
export class ConstraintsDto {
  @ApiProperty({ required: false, default: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxExamsPerStudentPerDay?: number = 2;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  avoidInterLocationTravel?: boolean = true;
}

// --- DTO chính cho Request Body ---

export class AdvancedScheduleDto {
  @ApiProperty({ type: [StudentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentDto)
  @ArrayMinSize(1)
  students!: StudentDto[];

  @ApiProperty({ type: [SubjectDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectDto)
  @ArrayMinSize(1)
  subjects!: SubjectDto[];

  @ApiProperty({ type: [RoomDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomDto)
  @ArrayMinSize(1)
  rooms!: RoomDto[];

  @ApiProperty({ type: [ProctorDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProctorDto)
  @ArrayMinSize(1)
  proctors!: ProctorDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConstraintsDto)
  constraints?: ConstraintsDto;
}
