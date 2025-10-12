import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { StudentResponseDto } from '@modules/core-data/students/dto/student-response.dto';
import { CourseResponseDto } from '@modules/algorithm-input/course/dto/course-response.dto';
import { ExamSessionResponseDto } from '@modules/algorithm-input/exam-session/dto/exam-session-response.dto';

@Exclude()
export class StudentCourseRegistrationResponseDto {
  @Expose()
  @ApiProperty({ example: 1 })
  id!: number;

  @Expose()
  @Type(() => StudentResponseDto)
  @ApiProperty({ type: () => StudentResponseDto })
  student!: StudentResponseDto;

  @Expose()
  @Type(() => CourseResponseDto)
  @ApiProperty({ type: () => CourseResponseDto })
  course!: CourseResponseDto;

  @Expose()
  @Type(() => ExamSessionResponseDto)
  @ApiProperty({ type: () => ExamSessionResponseDto })
  examSession!: ExamSessionResponseDto;

  @Expose()
  @ApiProperty({ example: true })
  is_active!: boolean;

  @Expose()
  @ApiProperty({ example: '2025-09-29T08:00:00.000Z' })
  createdAt?: Date;

  @Expose()
  @ApiProperty({ example: '2025-09-29T08:00:00.000Z' })
  updatedAt?: Date;
}
