import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateStudentExamGroupDto {
  @ApiProperty({ description: 'ID sinh viên', example: 101 })
  @IsInt()
  @IsNotEmpty()
  student_id!: number;

  @ApiProperty({ description: 'ID nhóm thi', example: 5 })
  @IsInt()
  @IsNotEmpty()
  exam_group_id!: number;

  @ApiProperty({
    description: 'Trạng thái tham gia',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_active!: boolean;
}
