import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, Min } from 'class-validator';

export class CreateStudentCourseRegistrationDto {
  @ApiProperty({
    description: 'ID sinh viên đăng ký',
    example: 1,
  })
  @IsInt()
  student_id!: number;

  @ApiProperty({
    description: 'ID học phần mà sinh viên đăng ký',
    example: 101,
  })
  @IsInt()
  course_id!: number;

  @ApiProperty({
    description: 'ID đợt thi mà sinh viên đăng ký',
    example: 5,
  })
  @IsInt()
  exam_session_id!: number;

  @ApiProperty({
    description:
      'Trạng thái sinh viên đăng ký (true: đã đăng ký, false: đã hủy)',
    example: true,
    default: true,
  })
  @IsBoolean()
  is_active!: boolean;
}
