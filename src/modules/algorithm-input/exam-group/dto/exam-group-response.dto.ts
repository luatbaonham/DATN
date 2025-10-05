import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

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

  @ApiProperty({ example: 1, description: 'ID học phần (FK Course)' })
  @Expose()
  course_id!: number;

  @ApiProperty({ example: 1, description: 'ID đợt thi (FK ExamSession)' })
  @Expose()
  exam_session_id!: number;

  @ApiProperty({
    example: 'not_scheduled',
    description: 'Trạng thái nhóm thi (not_scheduled / scheduled)',
  })
  @Expose()
  status!: string;

  @ApiProperty({ example: '2025-10-04T10:00:00Z', description: 'Ngày tạo' })
  @Expose()
  createAt?: Date;

  @ApiProperty({
    example: '2025-10-04T10:00:00Z',
    description: 'Ngày cập nhật',
  })
  @Expose()
  updateAt?: Date;
}
