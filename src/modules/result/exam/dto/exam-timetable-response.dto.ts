import { ApiProperty } from '@nestjs/swagger';

export class RoomDetailDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'P101' })
  code!: string;

  @ApiProperty({ example: 50 })
  capacity!: number;

  @ApiProperty({ example: 'LT' })
  type!: string;

  @ApiProperty({ example: 'Tòa A' })
  locationName!: string;
}

export class SlotDetailDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Ca 1' })
  slotName!: string;

  @ApiProperty({ example: '08:00' })
  startTime!: string;

  @ApiProperty({ example: '09:30' })
  endTime!: string;
}

export class SimplifiedExamEventDto {
  @ApiProperty({ example: '08:00 - 09:30' })
  time!: string;

  @ApiProperty({ example: '2025-01-15' })
  date!: string;

  @ApiProperty({ example: 'Thứ Hai' })
  dayOfWeek!: string;

  @ApiProperty({ example: '1' })
  examId!: string;

  @ApiProperty({ example: '1' })
  examGroup!: string;

  @ApiProperty({ example: 'IT101' })
  courseCode!: string;

  @ApiProperty({ type: SlotDetailDto })
  slot!: SlotDetailDto;

  @ApiProperty({ type: RoomDetailDto })
  room!: RoomDetailDto;

  @ApiProperty({ example: 'Lập trình cơ bản' })
  courseName!: string;

  @ApiProperty({ example: 90 })
  duration!: number;

  @ApiProperty({ example: '1' })
  location!: string;

  @ApiProperty({ example: '1' })
  proctor!: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  proctorName!: string;

  @ApiProperty({ example: 50 })
  studentCount!: number;
}

export class TimetableDayDto {
  @ApiProperty({ example: 'Thứ Hai' })
  day!: string;

  @ApiProperty({ example: '2025-01-15' })
  date!: string;

  @ApiProperty({ type: [SimplifiedExamEventDto] })
  morning!: SimplifiedExamEventDto[];

  @ApiProperty({ type: [SimplifiedExamEventDto] })
  afternoon!: SimplifiedExamEventDto[];
}

export class ExamTimetableResponseDto {
  @ApiProperty({ type: [TimetableDayDto] })
  timetable!: TimetableDayDto[];

  @ApiProperty({ example: 100 })
  totalExams!: number;
}
