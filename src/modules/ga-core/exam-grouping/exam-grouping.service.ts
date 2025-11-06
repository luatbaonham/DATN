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

  async generateExamGroups(examSessionId: number) {
    // --- 1️⃣ Kiểm tra đợt thi ---
    const examSession = await this.em.findOne(
      ExamSession,
      { id: examSessionId },
      { populate: ['location'] },
    );
    if (!examSession) throw new NotFoundException('Đợt thi không tồn tại');

    // --- 2️⃣ Lấy dữ liệu cần thiết ---
    const rooms = await this.em.find(Room, { location: examSession.location });
    const registrations = await this.em.find(
      StudentCourseRegistration,
      { examSession: examSessionId },
      { populate: ['student', 'course'] },
    );

    if (!rooms.length)
      throw new NotFoundException('Không có phòng nào trong cơ sở của đợt thi');
    if (!registrations.length)
      throw new NotFoundException('Không có sinh viên đăng ký thi');

    const maxCapacity = Math.max(...rooms.map((r) => r.capacity));

    // --- 3️⃣ Hủy kích hoạt nhóm cũ (nếu có) ---
    await this.em.nativeUpdate(
      ExamGroup,
      { examSession, is_active: true },
      { is_active: false },
    );
    await this.em.nativeUpdate(
      StudentExamGroup,
      { is_active: true },
      { is_active: false },
    );

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
        const groupCode = `G${groupCounter.toString().padStart(3, '0')}`;

        const examGroup = this.em.create(ExamGroup, {
          code: groupCode,
          course,
          examSession,
          expected_student_count: groupStudents.length,
          status: 'not_scheduled',
          is_active: true,
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

    // --- Debug logs ---
    const totalStudents = registrations.length;
    const totalGroups = newExamGroups.length;
    const avgGroupSize =
      totalStudents > 0 ? (totalStudents / totalGroups).toFixed(2) : 0;

    console.log(
      '🏫 Rooms:',
      rooms.map((r) => ({ id: r.id, capacity: r.capacity })),
    );
    console.log('📊 Max capacity:', maxCapacity);
    console.log('👩‍🎓 Total students:', totalStudents);
    console.log('👥 Total groups:', totalGroups);
    console.log('📈 Average group size:', avgGroupSize);
    console.log(
      '🏢 Room capacities:',
      rooms.map((r) => r.capacity),
    );

    // --- 7️⃣ Trả kết quả ---
    return {
      message: '✅ Tạo nhóm thi thành công',
      examSession: examSession.name,
      totalGroups: newExamGroups.length,
      totalStudents: newStudentExamGroups.length,
      maxCapacity,
    };
  }
}
