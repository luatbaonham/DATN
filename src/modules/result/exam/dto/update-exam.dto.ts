import { PartialType } from '@nestjs/swagger';
import { CreateExamDto } from './create-exam.dto';
import { IsArray, IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class SupervisorAssignmentDto {
  @ApiProperty({ description: 'ID của giảng viên' })
  @IsNumber()
  lecturerId!: number;

  @ApiProperty({ description: 'Vai trò của giảng viên', example: 'Supervisor' })
  @IsString()
  role!: string;
}

export class UpdateExamDto extends PartialType(CreateExamDto) {
  @ApiProperty({
    description: 'Danh sách ID sinh viên tham gia thi',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  studentIds?: number[];

  @ApiProperty({
    description: 'Danh sách giảng viên giám thị',
    type: [SupervisorAssignmentDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @Type(() => SupervisorAssignmentDto)
  supervisorIds?: SupervisorAssignmentDto[];
}
