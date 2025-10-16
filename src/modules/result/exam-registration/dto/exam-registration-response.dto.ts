import { StudentResponseDto } from '@modules/core-data/students/dto/student-response.dto';
import { ExamResponseDto } from '@modules/result/exam/dto/exam-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ExamRegistrationResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty({ type: ExamResponseDto })
  @Expose()
  @Type(() => ExamResponseDto)
  exam!: ExamResponseDto;

  @ApiProperty({ type: StudentResponseDto })
  @Expose()
  @Type(() => StudentResponseDto)
  student!: StudentResponseDto;

  @ApiProperty({ required: false })
  createdAt?: Date;
}
