import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Collection,
  OneToMany,
} from '@mikro-orm/core';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';
import { Exam } from '@modules/result/exam/entities/exam.entity';

@Entity()
export class ExamSlot {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => ExamSession)
  examSession!: ExamSession;

  @Property()
  slotName!: string;

  @Property()
  startTime!: string; // HH:MM

  @Property()
  endTime!: string; // HH:MM

  @Property({ nullable: true })
  description?: string;

  @OneToMany(() => Exam, (exam) => exam.examSlot)
  exam = new Collection<Exam>(this);

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
