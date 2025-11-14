import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Course } from '@modules/algorithm-input/course/entities/course.entity';
import { Department } from '@modules/core-data/departments/entities/department.entity';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';

@Entity()
@Unique({ properties: ['course', 'department', 'examSession'] })
// Cùng môn & khoa có thể xuất hiện nhiều lần ở các đợt thi khác nhau, nhưng không trùng trong cùng 1 đợt
export class CourseDepartment {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Course)
  course!: Course;

  @ManyToOne(() => Department)
  department!: Department;

  @ManyToOne(() => ExamSession)
  examSession!: ExamSession;

  // ✅ Môn bắt buộc trong chương trình đào tạo của khoa này
  @Property({ default: false })
  isCompulsory!: boolean;

  // ✅ Trạng thái hoạt động
  @Property({ default: true })
  isActive!: boolean;

  // ✅ Thời gian tạo và cập nhật
  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
