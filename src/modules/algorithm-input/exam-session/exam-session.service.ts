import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { ExamSession } from './entities/exam-session.entity';
import { CreateExamSessionDto } from './dto/create-exam-session.dto';
import { UpdateExamSessionDto } from './dto/update-exam-session.dto';
import { Locations } from '../location/entities/locations.entity';
import { StudentCourseRegistration } from '../student-course-registration/entities/student-course-registration.entity';
import { Room } from '../room/entities/room.entity';
import { ExamGroup } from '../exam-group/entities/exam-group.entity';
import { StudentExamGroup } from '../student-exam-group/entities/student-exam-group.entity';
import { Course } from '../course/entities/course.entity';

@Injectable()
export class ExamSessionService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateExamSessionDto): Promise<ExamSession> {
    const location = await this.em.getReference(Locations, dto.location_id);
    const examSession = this.em.create(ExamSession, {
      ...dto,
      location,
    });
    await this.em.persistAndFlush(examSession);
    return examSession;
  }

  /**
   * Tự động tạo exam groups và student exam groups dựa trên:
   * - student_course_registrations
   * - rooms (để xác định sức chứa tối đa)
   * - courses (để lấy thông tin môn học)
   */
  async generateExamGroupsForSession(examSessionId: number): Promise<{
    examGroupsCreated: number;
    studentExamGroupsCreated: number;
  }> {
    const examSession = await this.em.findOne(ExamSession, {
      id: examSessionId,
    });
    if (!examSession) {
      throw new NotFoundException('Không tìm thấy đợt thi');
    }
    // 1. Lấy tất cả đăng ký môn học của đợt thi này
    const registrations = await this.em.find(
      StudentCourseRegistration,
      {
        examSession: examSession,
        is_active: true,
      },
      {
        populate: ['student', 'course'],
      },
    );

    if (registrations.length === 0) {
      return {
        examGroupsCreated: 0,
        studentExamGroupsCreated: 0,
      };
    }

    // 2. Lấy sức chứa phòng lớn nhất
    const rooms = await this.em.find(Room, { is_active: true });
    if (rooms.length === 0) {
      throw new BadRequestException('Không có phòng thi nào khả dụng');
    }
    const maxCapacity = Math.max(...rooms.map((r) => r.capacity));

    // 3. Nhóm sinh viên theo môn học
    const courseStudentMap = new Map<
      number,
      { course: Course; studentIds: number[] }
    >();

    for (const reg of registrations) {
      const courseId = reg.course.id;
      if (!courseStudentMap.has(courseId)) {
        courseStudentMap.set(courseId, {
          course: reg.course,
          studentIds: [],
        });
      }
      courseStudentMap.get(courseId)!.studentIds.push(reg.student.id);
    }

    // 4. Chia nhóm thi dựa trên sức chứa phòng
    let examGroupsCreated = 0;
    let studentExamGroupsCreated = 0;

    for (const [courseId, data] of courseStudentMap.entries()) {
      const { course, studentIds } = data;
      const totalStudents = studentIds.length;
      let remainingStudents = totalStudents;
      let groupCounter = 1;
      let studentIndex = 0;

      while (remainingStudents > 0) {
        const groupSize = Math.min(remainingStudents, maxCapacity);
        const studentsInThisGroup = studentIds.slice(
          studentIndex,
          studentIndex + groupSize,
        );

        // Tạo exam group
        const examGroupCode = `${course.codeCourse}-${examSession.name}-G${groupCounter}`;
        const examGroup = this.em.create(ExamGroup, {
          code: examGroupCode,
          expected_student_count: groupSize,
          status: 'not_scheduled',
          course: course,
          examSession: examSession,
        });

        await this.em.persistAndFlush(examGroup);
        examGroupsCreated++;

        // Tạo student exam groups
        for (const studentId of studentsInThisGroup) {
          const student = this.em.getReference('Student', studentId);
          const studentExamGroup = this.em.create(StudentExamGroup, {
            student: student as any,
            examGroup: examGroup,
            is_active: true,
          });
          this.em.persist(studentExamGroup);
          studentExamGroupsCreated++;
        }

        await this.em.flush();

        remainingStudents -= groupSize;
        studentIndex += groupSize;
        groupCounter++;
      }
    }

    return {
      examGroupsCreated,
      studentExamGroupsCreated,
    };
  }

  async findAll(): Promise<ExamSession[]> {
    return this.em.find(ExamSession, {});
  }

  async findOne(id: number): Promise<ExamSession | null> {
    return this.em.findOne(ExamSession, { id });
  }

  async update(
    id: number,
    dto: UpdateExamSessionDto,
  ): Promise<ExamSession | null> {
    const examSession = await this.em.findOne(ExamSession, { id });
    if (!examSession) {
      throw new NotFoundException('Không tìm thấy đợt thi');
    }

    const cleanDto = Object.fromEntries(
      Object.entries(dto).filter(([_, v]) => v !== undefined),
    );

    this.em.assign(examSession, cleanDto);
    await this.em.persistAndFlush(examSession);
    return examSession;
  }

  async remove(id: number): Promise<boolean> {
    const examSession = await this.em.findOne(ExamSession, { id });
    if (!examSession) return false;

    await this.em.removeAndFlush(examSession);
    return true;
  }
}
