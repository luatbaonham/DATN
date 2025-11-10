import { ExamGroupResponseDto } from '@modules/algorithm-input/exam-group/dto/exam-group-response.dto';
import { ExamSessionResponseDto } from '@modules/algorithm-input/exam-session/dto/exam-session-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class LocationDto {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  code!: string;

  @ApiProperty()
  @Expose()
  name!: string;
}

export class RoomDto {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  code!: string;

  @ApiProperty()
  @Expose()
  capacity!: number;

  @ApiProperty()
  @Expose()
  type!: string;

  @ApiProperty()
  @Expose()
  is_active!: boolean;

  @ApiProperty({ type: LocationDto })
  @Expose()
  @Type(() => LocationDto)
  location!: LocationDto;
}

export class ExamSlotDto {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  slotName!: string;

  @ApiProperty()
  @Expose()
  startTime!: string;

  @ApiProperty()
  @Expose()
  endTime!: string;
}
export class ExamResponseDto {
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
  status?: string;

  @ApiProperty({ type: ExamSessionResponseDto })
  @Expose()
  @Type(() => ExamSessionResponseDto)
  examSession!: ExamSessionResponseDto;

  @ApiProperty({ type: ExamGroupResponseDto })
  @Expose()
  @Type(() => ExamGroupResponseDto)
  examGroup!: ExamGroupResponseDto;

  @ApiProperty({ type: RoomDto })
  @Expose()
  @Type(() => RoomDto)
  room!: RoomDto;

  @ApiProperty({ type: ExamSlotDto })
  @Expose()
  @Type(() => ExamSlotDto)
  examSlot!: ExamSlotDto;

  @ApiProperty()
  @Expose()
  createdAt?: Date;

  @ApiProperty()
  @Expose()
  updatedAt?: Date;
}
