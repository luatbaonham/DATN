import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber } from 'class-validator';

export class CreateCourseDepartmentDto {
  @ApiProperty({ description: 'ID môn học' })
  @IsNumber()
  courseId!: number;

  @ApiProperty({ description: 'ID khoa' })
  @IsNumber()
  departmentId!: number;

  @ApiProperty({ description: 'ID đợt thi' })
  @IsNumber()
  examSessionId!: number;

  @ApiProperty({ description: 'Môn bắt buộc', default: false })
  @IsBoolean()
  isCompulsory!: boolean;
}
