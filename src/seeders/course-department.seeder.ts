import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/mysql';
import { Course } from '@modules/algorithm-input/course/entities/course.entity';
import { Department } from '@modules/core-data/departments/entities/department.entity';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';
import { CourseDepartment } from '@modules/algorithm-input/course-department/entities/course-department.entity';

export class CourseDepartmentSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const courses = await em.find(Course, {});
    const departments = await em.find(Department, {});
    const examSessions = await em.find(ExamSession, { is_active: true });

    if (!examSessions.length) throw new Error('❌ Chưa có đợt thi nào active');
    if (!courses.length) throw new Error('❌ Chưa có môn học nào');
    if (!departments.length) throw new Error('❌ Chưa có khoa nào');

    const courseDeps: CourseDepartment[] = [];

    for (const examSession of examSessions) {
      for (const course of courses) {
        // Random chọn 1-2 khoa cho mỗi môn trong đợt thi này
        const shuffled = [...departments].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(2, departments.length));

        for (const dept of selected) {
          courseDeps.push(
            em.create(CourseDepartment, {
              course,
              department: dept,
              examSession,
              isCompulsory: Math.random() < 0.5, // ngẫu nhiên bắt buộc hay không
              isActive: true,
            }),
          );
        }
      }
    }

    await em.persistAndFlush(courseDeps);
    console.log(`✅ Đã tạo ${courseDeps.length} CourseDepartment`);
  }
}
