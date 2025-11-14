import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/mysql';
import { Student } from '@modules/core-data/students/entities/student.entity';
import { Course } from '@modules/algorithm-input/course/entities/course.entity';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';
import { StudentCourseRegistration } from '@modules/algorithm-input/student-course-registration/entities/student-course-registration.entity';
import { CourseDepartment } from '@modules/algorithm-input/course-department/entities/course-department.entity';

export class StudentCourseRegistrationSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const students = await em.find(
      Student,
      {},
      { populate: ['classes.department'] },
    );
    const examSession = await em.findOne(ExamSession, { id: 1 });

    if (!examSession) throw new Error('❌ Không tìm thấy đợt thi');
    if (!students.length) throw new Error('❌ Không có sinh viên nào');

    // Lấy thông tin môn học kèm khoa tổ chức
    const courseDepartments = await em.find(
      CourseDepartment,
      {},
      { populate: ['course', 'department'] },
    );

    console.log(
      `🔹 Đang tạo đăng ký học phần cho ${students.length} sinh viên...`,
    );

    const regs: StudentCourseRegistration[] = [];

    for (const student of students) {
      const studentDept = student.classes.department;
      const sameDeptCourses = courseDepartments.filter(
        (cd) => cd.department.id === studentDept.id,
      );
      const otherDeptCourses = courseDepartments.filter(
        (cd) => cd.department.id !== studentDept.id,
      );

      // Random xác suất 80% học môn của khoa mình
      const useOwnDept = Math.random() < 0.8;
      const availableCourses = useOwnDept ? sameDeptCourses : otherDeptCourses;

      // Nếu khoa mình chưa có môn, fallback sang all courses
      const pool = availableCourses.length
        ? availableCourses
        : courseDepartments;

      // Random 2–3 môn
      const numCourses = Math.floor(Math.random() * 2) + 2;
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, numCourses);

      for (const cd of selected) {
        regs.push(
          em.create(StudentCourseRegistration, {
            student,
            courseDepartment: cd,
            is_active: true,
          }),
        );
      }
    }

    await em.persistAndFlush(regs);
    console.log(`✅ Đã tạo ${regs.length} bản ghi StudentCourseRegistration`);
  }
}
