import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateExamSupervisorDto {
  @ApiProperty({ description: 'ID kỳ thi' })
  @IsInt()
  examId!: number;

  @ApiProperty({ description: 'ID giảng viên' })
  @IsInt()
  lecturerId!: number;

  @ApiProperty({ description: 'Vai trò (Chính / Phụ)' })
  @IsString()
  role!: string;
}
