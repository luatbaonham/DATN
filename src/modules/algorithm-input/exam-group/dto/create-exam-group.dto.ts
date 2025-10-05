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
  @ApiProperty({ example: 'EG001', description: 'Mã nhóm thi (duy nhất)' })
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

  @ApiProperty({ example: 1, description: 'ID học phần (FK Course)' })
  @IsInt()
  course_id!: number;

  @ApiProperty({ example: 1, description: 'ID đợt thi (FK ExamSession)' })
  @IsInt()
  exam_session_id!: number;

  @ApiProperty({
    description: 'Trạng thái nhóm thi',
    example: 'not_scheduled',
    default: 'not_scheduled',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
