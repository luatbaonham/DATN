import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class StudentInExamDto {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  studentCode!: string;

  @ApiProperty()
  @Expose()
  fullName!: string;

  @ApiProperty()
  @Expose()
  email?: string;

  @ApiProperty()
  @Expose()
  className?: string;
}

export class SupervisorInExamDto {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  lecturerCode!: string;

  @ApiProperty()
  @Expose()
  fullName!: string;

  @ApiProperty()
  @Expose()
  email?: string;

  @ApiProperty()
  @Expose()
  role!: string;
}

export class ExamDetailDto {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  examDate!: Date;

  @ApiProperty()
  @Expose()
  duration!: number;

  @ApiProperty()
  @Expose()
  status!: string;

  @ApiProperty()
  @Expose()
  examGroupName?: string;

  @ApiProperty()
  @Expose()
  courseCode?: string;

  @ApiProperty()
  @Expose()
  courseName?: string;

  @ApiProperty()
  @Expose()
  roomName?: string;

  @ApiProperty()
  @Expose()
  examSlotName?: string;

  @ApiProperty({ type: [StudentInExamDto] })
  @Expose()
  @Type(() => StudentInExamDto)
  students!: StudentInExamDto[];

  @ApiProperty({ type: [SupervisorInExamDto] })
  @Expose()
  @Type(() => SupervisorInExamDto)
  supervisors!: SupervisorInExamDto[];
}
