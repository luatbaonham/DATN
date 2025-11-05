import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { ExamGroup } from '@modules/algorithm-input/exam-group/entities/exam-group.entity';
import { StudentCourseRegistration } from '@modules/algorithm-input/student-course-registration/entities/student-course-registration.entity';

@Entity()
export class Course {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  codeCourse!: string;

  @Property()
  nameCourse!: string;

  @Property()
  description?: string;

  @Property({ type: 'int', default: 3 })
  credits!: number; //số tín chỉ

  @Property({ type: 'int', default: 0 })
  expected_students!: number; // Số SV dự kiến đăng ký

  @Property({ type: 'int' })
  durationCourseExam?: number;

  @Property({ default: true })
  is_active!: boolean; // Môn học đang mở/khóa

  @OneToMany(() => ExamGroup, (examGroup) => examGroup.course)
  examGroup = new Collection<ExamGroup>(this);

  @OneToMany(() => StudentCourseRegistration, (scr) => scr.course)
  registrations = new Collection<StudentCourseRegistration>(this);

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
