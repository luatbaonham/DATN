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
    example: 1,
    description: 'ID tổ bộ môn (FK CourseDepartment)',
  })
  @IsInt()
  course_department_id!: number;

  @ApiProperty({
    description:
      'Trạng thái sinh viên đăng ký (true: đã đăng ký, false: đã hủy)',
    example: true,
    default: true,
  })
  @IsBoolean()
  is_active!: boolean;
}
