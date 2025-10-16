import { Entity, PrimaryKey, ManyToOne, Property } from '@mikro-orm/core';
import { Exam } from '@modules/result/exam/entities/exam.entity';
import { Student } from '@modules/core-data/students/entities/student.entity';

@Entity()
export class ExamRegistration {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Exam)
  exam!: Exam;

  @ManyToOne(() => Student)
  student!: Student;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;
}
