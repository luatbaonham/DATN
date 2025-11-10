import { PartialType } from '@nestjs/swagger';
import { CreateExamDto } from './create-exam.dto';
import { IsArray, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateExamDto extends PartialType(CreateExamDto) {
  @ApiProperty({
    description: 'Danh sách ID sinh viên cần thêm vào kỳ thi',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  studentIds?: number[];

  @ApiProperty({
    description: 'Danh sách ID giảng viên cần thêm vào kỳ thi',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  supervisorIds?: number[];
}
