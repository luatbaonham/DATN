import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
  Min,
} from 'class-validator';

// DTO cho từng đăng ký thô
class RawRegistrationDto {
  @ApiProperty({ example: 'SV001' })
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty({ example: 'GT1' })
  @IsString()
  @IsNotEmpty()
  courseCode!: string;
}

// DTO cho thông tin môn học
class CourseInfoDto {
  @ApiProperty({ example: 'GT1' })
  @IsString()
  @IsNotEmpty()
  courseCode!: string;

  @ApiProperty({ example: 90 })
  @IsInt()
  @Min(1)
  duration!: number;
}

// DTO cho thông tin phòng
class RoomInfoDto {
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

// DTO chính cho body của request
export class CreateExamGroupsDto {
  @ApiProperty({ type: [RawRegistrationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RawRegistrationDto)
  rawRegistrations!: RawRegistrationDto[];

  @ApiProperty({ type: [RoomInfoDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomInfoDto)
  allRooms!: RoomInfoDto[];

  @ApiProperty({ type: [CourseInfoDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseInfoDto)
  allCourses!: CourseInfoDto[];
}

// --- Định nghĩa kiểu đầu ra (để service sử dụng) ---
// (Chúng ta có thể import từ DTO của scheduling, nhưng khai báo lại ở đây cho rõ ràng)
export type ExamGroupOutputDto = {
  examGroupId: string;
  courseCode: string;
  studentCount: number;
  duration: number;
};

export type StudentOutputDto = {
  studentId: string;
  examGroups: string[];
};
