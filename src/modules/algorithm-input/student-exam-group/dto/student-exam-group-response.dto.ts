import { ApiProperty } from '@nestjs/swagger';

export class StudentExamGroupResponseDto {
  @ApiProperty({ description: 'ID quan hệ SV - Nhóm thi', example: 1 })
  id!: number;

  @ApiProperty({ description: 'ID sinh viên', example: 101 })
  student_id!: number;

  @ApiProperty({ description: 'ID nhóm thi', example: 5 })
  exam_group_id!: number;

  @ApiProperty({
    description: 'Trạng thái tham gia nhóm thi',
    example: true,
    default: true,
  })
  is_active!: boolean;
}
