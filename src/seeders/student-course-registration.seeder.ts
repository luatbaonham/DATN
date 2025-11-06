// import { Seeder } from '@mikro-orm/seeder';
// import { EntityManager } from '@mikro-orm/mysql';
// import { Student } from '@modules/core-data/students/entities/student.entity';
// import { Course } from '@modules/algorithm-input/course/entities/course.entity';
// import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';
// import { StudentCourseRegistration } from '@modules/algorithm-input/student-course-registration/entities/student-course-registration.entity';

// export class StudentCourseRegistrationSeeder extends Seeder {
//   async run(em: EntityManager): Promise<void> {
//     const students = await em.find(Student, {});
//     const courses = await em.find(Course, {});
//     const examSession = await em.findOne(ExamSession, { id: 2 });

//     if (!examSession) throw new Error('❌ Không tìm thấy đợt thi ID = 1');
//     if (!students.length) throw new Error('❌ Không có sinh viên nào');
//     if (!courses.length) throw new Error('❌ Không có môn học nào');

//     console.log(
//       `🔹 Đang tạo đăng ký học phần cho ${students.length} sinh viên...`,
//     );

//     let totalInserted = 0;

//     for (const student of students) {
//       // Random 3-6 môn
//       const numCourses = Math.floor(Math.random() * 4) + 3; // 3→6
//       const shuffled = [...courses].sort(() => Math.random() - 0.5);
//       const selectedCourses = shuffled.slice(0, numCourses);

//       for (const course of selectedCourses) {
//         // Kiểm tra xem đã tồn tại chưa (tránh trùng)
//         const existing = await em.findOne(StudentCourseRegistration, {
//           student,
//           course,
//           examSession,
//         });
//         if (!existing) {
//           const reg = em.create(StudentCourseRegistration, {
//             student,
//             course,
//             examSession,
//             is_active: true,
//           });
//           em.persist(reg);
//           totalInserted++;
//         }
//       }
//     }

//     await em.flush();

//     console.log(`✅ Đã tạo ${totalInserted} bản ghi StudentCourseRegistration`);
//   }
// }
import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/mysql';
import { Student } from '@modules/core-data/students/entities/student.entity';
import { Course } from '@modules/algorithm-input/course/entities/course.entity';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';
import { StudentCourseRegistration } from '@modules/algorithm-input/student-course-registration/entities/student-course-registration.entity';

export class StudentCourseRegistrationSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const students = await em.find(Student, {}); // 👉 chỉ lấy 5 sinh viên đầu { limit: 5 }
    const courses = await em.find(Course, {}, { limit: 2 });
    const examSession = await em.findOne(ExamSession, { id: 1 });

    if (!examSession) throw new Error('❌ Không tìm thấy đợt thi');
    if (!students.length) throw new Error('❌ Không có sinh viên nào');
    if (!courses.length) throw new Error('❌ Không có môn học nào');

    console.log(
      `🔹 Đang tạo đăng ký học phần cho ${students.length} sinh viên...`,
    );

    const regs: StudentCourseRegistration[] = [];

    for (const student of students) {
      // Random 2–3 môn cho mỗi sinh viên
      const numCourses = Math.floor(Math.random() * 2) + 2;
      const shuffled = [...courses].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, numCourses);

      for (const course of selected) {
        regs.push(
          em.create(StudentCourseRegistration, {
            student,
            course,
            examSession,
            is_active: true,
          }),
        );
      }
    }

    await em.persistAndFlush(regs);
    console.log(`✅ Đã tạo ${regs.length} bản ghi StudentCourseRegistration`);
  }
}
