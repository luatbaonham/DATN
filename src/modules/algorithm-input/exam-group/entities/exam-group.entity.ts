import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Course } from '@modules/algorithm-input/course/entities/course.entity';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';
import { StudentExamGroup } from '@modules/algorithm-input/student-exam-group/entities/student-exam-group.entity';

@Entity({ tableName: 'exam_groups' })
export class ExamGroup {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  code!: string; // mã_nhóm_thi

  @Property({ default: 0 })
  expected_student_count!: number; // số SV dự kiến

  @Property({ default: 'not_scheduled' })
  status!: string; // not_scheduled / scheduled

  @ManyToOne(() => Course)
  course!: Course;

  @ManyToOne(() => ExamSession)
  examSession!: ExamSession;

  @OneToMany(() => StudentExamGroup, (seg) => seg.examGroup)
  studentExamGroups = new Collection<StudentExamGroup>(this);

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
