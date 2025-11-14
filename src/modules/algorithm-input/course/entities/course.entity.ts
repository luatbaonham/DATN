import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { CourseDepartment } from '@modules/algorithm-input/course-department/entities/course-department.entity';
import { ExamGroup } from '@modules/algorithm-input/exam-group/entities/exam-group.entity';
import { StudentCourseRegistration } from '@modules/algorithm-input/student-course-registration/entities/student-course-registration.entity';
import { Department } from '@modules/core-data/departments/entities/department.entity';

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

  @Property({ type: 'int', default: 90 })
  duration_course_exam!: number;

  @Property({ type: 'int', default: 0 })
  expected_students!: number; // Số SV dự kiến đăng ký

  @Property({ default: true })
  is_active!: boolean; // Môn học đang mở/khóa

  @OneToMany(() => CourseDepartment, (cd) => cd.course)
  courseDepartments = new Collection<CourseDepartment>(this);

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
