import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { ExamGroup } from '@modules/algorithm-input/exam-group/entities/exam-group.entity';
import { Student } from '@modules/core-data/students/entities/student.entity';

@Entity({ tableName: 'student_exam_groups' })
export class StudentExamGroup {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Student)
  student!: Student;

  @ManyToOne(() => ExamGroup)
  examGroup!: ExamGroup;

  @Property({ default: true })
  is_active!: boolean; // true: đang trong nhóm, false: đã rời nhóm
}
