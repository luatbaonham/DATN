import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Course } from '@modules/algorithm-input/course/entities/course.entity';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';
import { Student } from '@modules/core-data/students/entities/student.entity';

@Entity({ tableName: 'student_course_registrations' })
export class StudentCourseRegistration {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Student)
  student!: Student;

  @ManyToOne(() => Course)
  course!: Course;

  @ManyToOne(() => ExamSession)
  examSession!: ExamSession;

  @Property({ default: true })
  is_active!: boolean;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
