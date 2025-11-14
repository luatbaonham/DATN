import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateExamGroupDto {
  @ApiProperty({ example: 'EG001', description: 'Mã nhóm thi' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({
    example: 50,
    description: 'Số sinh viên dự kiến của nhóm thi',
    default: 0,
  })
  @IsInt()
  @Min(0)
  expected_student_count!: number;

  @ApiProperty({ example: 1, description: 'ID đợt thi (FK ExamSession)' })
  @IsInt()
  exam_session_id!: number;

  @ApiProperty({
    example: 1,
    description: 'ID tổ bộ môn (FK CourseDepartment)',
  })
  @IsInt()
  course_department_id!: number;

  @ApiProperty({
    description: 'Sức chứa phòng được gợi ý (từ thuật toán)',
    example: 60,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  recommended_room_capacity?: number;

  @ApiProperty({
    description: 'Trạng thái nhóm thi', //trạng thái này là nhóm thi đã đc công bố hay gì hay chưa
    example: 'not_scheduled',
    default: 'not_scheduled',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
