import { Entity, PrimaryKey, ManyToOne, Property } from '@mikro-orm/core';
import { Exam } from '@modules/result/exam/entities/exam.entity';
import { Lecturer } from '@modules/core-data/lecturer/entities/lecturer.entity';

@Entity()
export class ExamSupervisor {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Exam)
  exam!: Exam;

  @ManyToOne(() => Lecturer)
  lecturer!: Lecturer;

  @Property()
  role!: string; // Chính / Phụ

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;
}
