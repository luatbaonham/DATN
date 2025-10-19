import { LecturerResponseDto } from '@modules/core-data/lecturer/dto/lecturer-response.dto';
import { ExamResponseDto } from '@modules/result/exam/dto/exam-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ExamSupervisorResponseDto {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty({ type: ExamResponseDto })
  @Expose()
  @Type(() => ExamResponseDto)
  exam!: ExamResponseDto;

  @ApiProperty({ type: LecturerResponseDto })
  @Expose()
  @Type(() => LecturerResponseDto)
  lecturer!: LecturerResponseDto;
}
