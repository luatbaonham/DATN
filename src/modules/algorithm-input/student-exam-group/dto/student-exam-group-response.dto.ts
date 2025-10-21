import { ExamGroupResponseDto } from '@modules/algorithm-input/exam-group/dto/exam-group-response.dto';
import { StudentResponseDto } from '@modules/core-data/students/dto/student-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class StudentExamGroupResponseDto {
  @ApiProperty({ description: 'ID quan hệ SV - Nhóm thi', example: 1 })
  id!: number;

  @ApiProperty({ type: StudentResponseDto, description: 'Thông tin sinh viên' })
  student!: StudentResponseDto;

  @ApiProperty({
    type: ExamGroupResponseDto,
    description: 'Thông tin nhóm thi',
  })
  examGroup!: ExamGroupResponseDto;

  @ApiProperty({
    description: 'Trạng thái tham gia nhóm thi',
    example: true,
    default: true,
  })
  is_active!: boolean;
}
