import { Entity, PrimaryKey, ManyToOne, Property } from '@mikro-orm/core';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';
import { RoomDto, LecturerDto } from '../dto/schedule-request.dto';

@Entity()
export class ScheduleConfig {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => ExamSession)
  examSession!: ExamSession;

  @Property()
  startDate!: string;

  @Property()
  endDate!: string;

  @Property({ type: 'json' })
  rooms!: RoomDto[];

  @Property({ type: 'json' })
  lecturers!: LecturerDto[];
}
