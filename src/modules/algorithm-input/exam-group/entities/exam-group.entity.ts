import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { CourseDepartment } from '@modules/algorithm-input/course-department/entities/course-department.entity';
import { Course } from '@modules/algorithm-input/course/entities/course.entity';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';
import { StudentExamGroup } from '@modules/algorithm-input/student-exam-group/entities/student-exam-group.entity';
import { Exam } from '@modules/result/exam/entities/exam.entity';

@Entity({ tableName: 'exam_groups' })
export class ExamGroup {
  @PrimaryKey()
  id!: number;

  @Property({ default: 0 })
  expected_student_count?: number;

  @Property({ default: 0 })
  actual_student_count?: number;

  @Property({ default: 'not_scheduled' })
  status!: string; // not_scheduled / scheduled

  @Property({ nullable: true })
  recommended_room_capacity?: number;

  @ManyToOne(() => CourseDepartment)
  courseDepartment!: CourseDepartment;

  @ManyToOne(() => ExamSession)
  examSession!: ExamSession;

  @OneToMany(() => StudentExamGroup, (seg) => seg.examGroup)
  studentExamGroups = new Collection<StudentExamGroup>(this);

  @OneToMany(() => Exam, (exam) => exam.examGroup)
  exam = new Collection<Exam>(this);

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
