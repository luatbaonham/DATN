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

  @ApiProperty({ example: 1, description: 'ID học phần (FK Course)' })
  @IsInt()
  course_id!: number;

  @ApiProperty({ example: 1, description: 'ID đợt thi (FK ExamSession)' })
  @IsInt()
  exam_session_id!: number;

  @ApiProperty({
    description: 'Trạng thái nhóm thi', //trạng thái này là nhóm thi đã đc công bố hay gì hay chưa
    example: 'not_scheduled',
    default: 'not_scheduled',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Trạng thái nhóm thi', // true: đang dùng, false: bị hủy (khi tạo lại)
    example: true,
    default: true,
  })
  @IsBoolean({ message: 'Trạng thái phải là true hoặc false' })
  is_active!: boolean;
}
