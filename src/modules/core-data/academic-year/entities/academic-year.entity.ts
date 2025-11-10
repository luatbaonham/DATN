import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
  Unique,
} from '@mikro-orm/core';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';

@Entity()
export class AcademicYear {
  @PrimaryKey()
  id!: number;

  @Property()
  @Unique()
  name!: string; // Ví dụ: "2025-2026"

  @Property()
  startDate!: Date;

  @Property()
  endDate!: Date;

  @OneToMany(() => ExamSession, (examSession) => examSession.academicYear)
  examSessions = new Collection<ExamSession>(this);

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}
