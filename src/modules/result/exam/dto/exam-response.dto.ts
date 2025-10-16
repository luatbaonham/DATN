import { ExamGroupResponseDto } from '@modules/algorithm-input/exam-group/dto/exam-group-response.dto';
import { ExamSessionResponseDto } from '@modules/algorithm-input/exam-session/dto/exam-session-response.dto';
import { RoomResponseDto } from '@modules/algorithm-input/room/dto/room-ressponse.dto';
import { ExamSlot } from '@modules/result/exam-slot/entities/exam-slot.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

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

  @ApiProperty({ type: RoomResponseDto })
  @Expose()
  @Type(() => RoomResponseDto)
  room!: RoomResponseDto;

  @ApiProperty({ type: ExamSlot })
  @Expose()
  @Type(() => ExamSlot)
  examSlot!: ExamSlot;

  @ApiProperty()
  @Expose()
  createdAt?: Date;

  @ApiProperty()
  @Expose()
  updatedAt?: Date;
}
