import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { ExamSession } from '../exam-session/entities/exam-session.entity';
import { ExamGroup } from '../exam-group/entities/exam-group.entity';
import { StudentExamGroup } from '../student-exam-group/entities/student-exam-group.entity';
import { StudentCourseRegistration } from '../student-course-registration/entities/student-course-registration.entity';
import { CourseDepartment } from '../course-department/entities/course-department.entity';

interface GaRoomInput {
  id: number;
  capacity: number;
  locationId: number;
}

@Injectable()
export class ExamGroupingService {
  constructor(private readonly em: EntityManager) {}

  async generateExamGroups(examSessionId: number, rooms: GaRoomInput[]) {
    const examSession = this.em.getReference(ExamSession, examSessionId);

    const registrations = await this.em.find(
      StudentCourseRegistration,
      { is_active: true },
      {
        populate: [
          'student',
          'courseDepartment.department',
          'courseDepartment.course',
        ],
      },
    );

    if (!rooms.length)
      throw new NotFoundException('Không có phòng nào trong cơ sở của đợt thi');
    if (!registrations.length)
      throw new NotFoundException('Không có sinh viên đăng ký thi');

    const sortedRooms = [...rooms].sort((a, b) => a.capacity - b.capacity);

    const groupedByCourseDept = new Map<
      number,
      {
        courseDepartment: CourseDepartment;
        registrations: StudentCourseRegistration[];
      }
    >();

    for (const reg of registrations) {
      const cd = reg.courseDepartment;
      if (!cd) {
        console.warn(
          `⚠️ Đăng ký không có courseDepartment: student=${reg.student.id}`,
        );
        continue;
      }

      const key = cd.id;
      if (!groupedByCourseDept.has(key)) {
        groupedByCourseDept.set(key, {
          courseDepartment: cd,
          registrations: [],
        });
      }
      groupedByCourseDept.get(key)!.registrations.push(reg);
    }

    const newExamGroups: ExamGroup[] = [];
    const newStudentExamGroups: StudentExamGroup[] = [];

    for (const {
      courseDepartment,
      registrations,
    } of groupedByCourseDept.values()) {
      const course = courseDepartment.course;
      if (!course) {
        console.warn(
          `⚠️ CourseDepartment không có Course: courseDepartment=${courseDepartment.id}`,
        );
        continue;
      }

      let index = 0;
      while (index < registrations.length) {
        const groupRegistrations = registrations.slice(
          index,
          index + sortedRooms[sortedRooms.length - 1].capacity,
        );
        const groupSize = groupRegistrations.length;

        const recommendedRoom =
          sortedRooms.find((r) => r.capacity >= groupSize) ??
          sortedRooms[sortedRooms.length - 1];

        const examGroup = this.em.create(ExamGroup, {
          examSession,
          courseDepartment,
          expected_student_count: groupSize,
          actual_student_count: groupSize,
          recommended_room_capacity: recommendedRoom.capacity,
          status: 'not_scheduled',
        });
        newExamGroups.push(examGroup);

        for (const reg of groupRegistrations) {
          const seg = this.em.create(StudentExamGroup, {
            student: reg.student,
            examGroup,
            is_active: true,
          });
          newStudentExamGroups.push(seg);
        }

        index += recommendedRoom.capacity;
      }
    }

    await this.em.transactional(async (em) => {
      await em.persistAndFlush([...newExamGroups, ...newStudentExamGroups]);
    });

    // --- Chuẩn hóa dữ liệu trả về cho GA service ---
    return {
      totalGroups: newExamGroups.length,
      totalStudents: newStudentExamGroups.length,
      examGroups: newExamGroups.map((eg) => ({
        examGroupId: eg.id, // ✅ GA service dùng
        courseId: eg.courseDepartment.course?.id ?? null,
        departmentId: eg.courseDepartment.department?.id ?? null,
        duration: eg.courseDepartment.course?.duration_course_exam ?? 90, // default nếu không có
        studentCount: eg.actual_student_count,
        status: eg.status,
      })),
      studentsByExamGroup: new Map<number, number[]>(
        newStudentExamGroups.reduce((acc, seg) => {
          const arr = acc.get(seg.examGroup.id) ?? [];
          arr.push(seg.student.id);
          acc.set(seg.examGroup.id, arr);
          return acc;
        }, new Map<number, number[]>()),
      ),
    };
  }
}
