import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { CreateInputRequestDto } from './dto/create-input-request.dto';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';
import { ExamGroup } from '@modules/algorithm-input/exam-group/entities/exam-group.entity';
import { Room } from '@modules/algorithm-input/room/entities/room.entity';
import { Student } from '@modules/core-data/students/entities/student.entity';
import { StudentExamGroup } from '@modules/algorithm-input/student-exam-group/entities/student-exam-group.entity';
import { Lecturer } from '@modules/core-data/lecturer/entities/lecturer.entity';
import { Constraint } from '@modules/constraints/entities/constraint.entity';
import { ConstraintValidator } from '../../algorithm-input/scheduling/constraint-schema/constraint-validator';

export interface ConstraintRuleInput {
  id: number;
  code: string;
  description: string;
  type: string;
  scope: string;
  isActive: boolean;
  rule: Record<string, any>;
}

@Injectable()
export class GenerateInputService {
  constructor(private readonly em: EntityManager) {}

  async generateRawInput(dto: CreateInputRequestDto) {
    const { examSessionId, rules } = dto;

    // --- 1️⃣ Lấy thông tin đợt thi ---
    const examSession = await this.em.findOne(ExamSession, {
      id: examSessionId,
    });
    if (!examSession) throw new NotFoundException('Đợt thi không tồn tại');

    // --- 2️⃣ Gom dữ liệu đầu vào ---
    const [examGroups, rooms, students, lecturers, studentExamGroups] =
      await Promise.all([
        this.em.find(
          ExamGroup,
          { examSession: examSessionId },
          { populate: ['course'] },
        ),
        this.em.find(Room, { location: examSession.location }),
        this.em.find(Student, {}),
        this.em.find(Lecturer, {}),
        this.em.find(
          StudentExamGroup,
          {},
          { populate: ['student', 'examGroup'] },
        ),
      ]);

    // --- 3️⃣ Gom constraint rule FE gửi ---
    const constraintRules: ConstraintRuleInput[] = [];

    for (const r of rules) {
      const constraint = await this.em.findOne(Constraint, {
        id: r.constraintId,
      });
      if (!constraint) {
        throw new NotFoundException(
          `Constraint ID ${r.constraintId} không tồn tại`,
        );
      }

      const validation = ConstraintValidator.validateRule(
        constraint.constraintCode,
        r.rule,
      );
      if (!validation.valid) {
        throw new BadRequestException({
          message: `Rule của constraint ${constraint.constraintCode} không hợp lệ`,
          errors: validation.errors,
        });
      }

      constraintRules.push({
        id: constraint.id,
        code: constraint.constraintCode,
        description: constraint.description,
        type: constraint.type,
        scope: constraint.scope,
        isActive: r.isActive,
        rule: validation.normalized,
      });
    }

    const groupedStudentExamGroups: Record<string, any> = {};

    for (const seg of studentExamGroups) {
      const studentId = seg.student.id;

      if (!groupedStudentExamGroups[studentId]) {
        groupedStudentExamGroups[studentId] = {
          studentId,
          studentName: `${seg.student.lastName} ${seg.student.firstName}`,
          examGroups: [],
        };
      }

      groupedStudentExamGroups[studentId].examGroups.push({
        name: seg.examGroup.course?.nameCourse ?? '',
      });
    }

    // --- 4️⃣ Chuẩn hóa đầu vào cho thuật toán ---
    const algorithmInput = {
      examSession: {
        id: examSession.id,
        name: examSession.name,
        startDate: examSession.start_date
          ? examSession.start_date.toISOString()
          : '',
        endDate: examSession.end_date ? examSession.end_date.toISOString() : '',
        location: examSession.location.toString(),
      },
      examGroups: examGroups.map((g) => ({
        id: g.id,
        expectedStudentCount: g.expected_student_count ?? 0,
        duration_course_exam: g.course?.duration_course_exam ?? 90,
        courseId: g.course?.id,
        courseCode: g.course?.codeCourse,
        courseName: g.course?.nameCourse,
      })),
      rooms: rooms.map((r) => ({
        id: r.id,
        code: r.code,
        capacity: r.capacity,
        location: r.location.toString(),
      })),
      lecturers: lecturers.map((l) => ({
        id: l.id,
        code: l.lecturerCode,
        departmentId: l.department,
      })),
      // danh sách sinh viên với các nhóm thi(biết sinh viên sẽ thi các môn nào)
      studentExamGroups: Object.values(groupedStudentExamGroups),
      constraints: constraintRules,
    };

    // --- 5️⃣ Log preview cho dev kiểm tra ---
    console.log('✅ Dữ liệu đầu vào thuật toán:');
    console.table(
      constraintRules.map((c) => ({
        ID: c.id,
        CODE: c.code,
        ACTIVE: c.isActive,
        RULE: JSON.stringify(c.rule),
      })),
    );

    return algorithmInput;
  }

  async generate(dto: CreateInputRequestDto) {
    const algorithmInput = await this.generateRawInput(dto);
    // --- Trả về preview cho FE ---
    return {
      message: 'Tập hợp dữ liệu đầu vào thành công',
      inputPreview: algorithmInput,
    };
  }
}
