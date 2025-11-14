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
import { Locations } from '@modules/algorithm-input/location/entities/locations.entity';
import { StudentCourseRegistration } from '@modules/algorithm-input/student-course-registration/entities/student-course-registration.entity';
import { AcademicYear } from '@modules/core-data/academic-year/entities/academic-year.entity';

@Entity({ tableName: 'exam_sessions' })
export class ExamSession {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string; // Tên đợt thi, ví dụ "Học kỳ 1 - 2025"

  @Property()
  start_date?: Date; //nếu null => chưa xếp lịch, nếu có => đã xếp

  @Property()
  end_date?: Date;

  @Property({ default: true })
  is_active!: boolean; // Kiểm soát đợt thi đang mở

  @Property({ nullable: true })
  description?: string;

  @ManyToOne(() => Locations)
  location!: Locations;

  @ManyToOne(() => AcademicYear)
  academicYear!: AcademicYear;

  @OneToMany(() => ExamGroup, (eg) => eg.examSession)
  examGroups = new Collection<ExamGroup>(this);

  @OneToMany(() => StudentCourseRegistration, (scr) => scr.examSession)
  registrations = new Collection<StudentCourseRegistration>(this);

  @OneToMany(() => CourseDepartment, (cd) => cd.examSession)
  courseDepartments = new Collection<CourseDepartment>(this);

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
