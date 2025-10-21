import { CourseResponseDto } from '@modules/algorithm-input/course/dto/course-response.dto';
import { ExamSessionResponseDto } from '@modules/algorithm-input/exam-session/dto/exam-session-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { type } from 'os';

@Exclude()
export class ExamGroupResponseDto {
  @ApiProperty({ example: 1, description: 'ID nhóm thi' })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'EG001', description: 'Mã nhóm thi' })
  @Expose()
  code!: string;

  @ApiProperty({ example: 50, description: 'Số sinh viên dự kiến' })
  @Expose()
  expected_student_count!: number;

  @ApiProperty({ type: CourseResponseDto, description: 'Thông tin khóa học' })
  @Type(() => CourseResponseDto)
  @Expose()
  course!: CourseResponseDto;

  @ApiProperty({
    type: ExamSessionResponseDto,
    description: 'Thông tin kỳ thi',
  })
  @Type(() => ExamSessionResponseDto)
  @Expose()
  examSession!: ExamSessionResponseDto;

  @ApiProperty({
    example: 'not_scheduled',
    description: 'Trạng thái nhóm thi (not_scheduled / scheduled)',
  })
  @Expose()
  status!: string;

  @ApiProperty({ example: '2025-10-04T10:00:00Z', description: 'Ngày tạo' })
  @Expose()
  createdAt?: Date;

  @ApiProperty({
    example: '2025-10-04T10:00:00Z',
    description: 'Ngày cập nhật',
  })
  @Expose()
  updatedAt?: Date;
}
