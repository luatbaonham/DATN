import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';
import { ExamGroup } from '@modules/algorithm-input/exam-group/entities/exam-group.entity';
import { StudentExamGroup } from '@modules/algorithm-input/student-exam-group/entities/student-exam-group.entity';
import { StudentCourseRegistration } from '@modules/algorithm-input/student-course-registration/entities/student-course-registration.entity';
import { Room } from '@modules/algorithm-input/room/entities/room.entity';
import { Student } from '@modules/core-data/students/entities/student.entity';
import { Course } from '@modules/algorithm-input/course/entities/course.entity';

@Injectable()
export class ExamGroupingService {
  constructor(private readonly em: EntityManager) {}

  async generateExamGroups(examSessionId: number, room: Room[]) {
    // --- 1️⃣ Kiểm tra đợt thi ---
    const examSession = await this.em.findOne(
      ExamSession,
      { id: examSessionId },
      { populate: ['location'] },
    );
    if (!examSession) throw new NotFoundException('Đợt thi không tồn tại');

    // --- 2️⃣ Lấy dữ liệu cần thiết ---
    // danh sách sinh viên đăng kí môn học
    const registrations = await this.em.find(
      StudentCourseRegistration,
      { examSession: examSessionId },
      { populate: ['student', 'course'] },
    );

    if (!room.length)
      throw new NotFoundException('Không có phòng nào trong cơ sở của đợt thi');
    if (!registrations.length)
      throw new NotFoundException('Không có sinh viên đăng ký thi');

    const maxCapacity = Math.max(...room.map((r) => r.capacity));

    // --- 4️⃣ Gom sinh viên theo môn học ---
    const groupedByCourse = new Map<
      number,
      { course: Course; students: Student[] }
    >();

    for (const reg of registrations) {
      const course = reg.course;
      if (!groupedByCourse.has(course.id)) {
        groupedByCourse.set(course.id, { course, students: [] });
      }
      groupedByCourse.get(course.id)!.students.push(reg.student);
    }

    // --- 5️⃣ Tạo nhóm thi ---
    const newExamGroups: ExamGroup[] = [];
    const newStudentExamGroups: StudentExamGroup[] = [];

    let groupCounter = 1;

    for (const [courseId, data] of groupedByCourse.entries()) {
      const { course, students } = data;
      const duration = course.duration_course_exam || 90;
      let index = 0;

      while (index < students.length) {
        const groupStudents = students.slice(index, index + maxCapacity);
        // G001, EX 1: 3 nhóm thi: G001, G002 G003, EX2: G001,
        //xóa code trong exam group

        const examGroup = this.em.create(ExamGroup, {
          course,
          examSession, //lấy từ fe
          expected_student_count: groupStudents.length,
          status: 'not_scheduled',
        });
        newExamGroups.push(examGroup);

        for (const student of groupStudents) {
          const seg = this.em.create(StudentExamGroup, {
            student,
            examGroup,
            is_active: true,
          });
          newStudentExamGroups.push(seg);
        }

        index += maxCapacity;
        groupCounter++;
      }
    }

    // --- 6️⃣ Lưu vào DB bằng transaction ---
    await this.em.begin();
    try {
      await this.em.persistAndFlush([
        ...newExamGroups,
        ...newStudentExamGroups,
      ]);
      await this.em.commit();
    } catch (err) {
      await this.em.rollback();
      throw err;
    }

    // --- 7️⃣ Tạo dữ liệu GA ---
    const studentsByExamGroup = new Map<number, number[]>();
    for (const seg of newStudentExamGroups) {
      const groupId = seg.examGroup.id;
      const studentId = seg.student.id;
      if (!studentsByExamGroup.has(groupId)) {
        studentsByExamGroup.set(groupId, []);
      }
      studentsByExamGroup.get(groupId)!.push(studentId);
    }

    const examGroups = newExamGroups.map((eg) => ({
      examGroupId: eg.id,
      courseId: eg.course.id,
      duration: eg.course.duration_course_exam || 90,
      studentCount: eg.expected_student_count,
    }));

    // --- 8️⃣ Trả về dữ liệu cho SchedulingService ---
    return {
      examGroups,
      studentsByExamGroup,
    };
  }
}
///
