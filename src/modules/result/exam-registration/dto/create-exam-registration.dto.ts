import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateExamRegistrationDto {
  @ApiProperty({ description: 'ID kỳ thi', example: 1 })
  @IsInt()
  @IsNotEmpty()
  examId!: number;

  @ApiProperty({ description: 'ID sinh viên', example: 42 })
  @IsInt()
  @IsNotEmpty()
  studentId!: number;
}
