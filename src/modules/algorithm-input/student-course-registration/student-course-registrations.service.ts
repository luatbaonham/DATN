import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { StudentCourseRegistration } from './entities/student-course-registration.entity';
import { CreateStudentCourseRegistrationDto } from './dto/create-student-course-registration.dto';
import { UpdateStudentCourseRegistrationDto } from './dto/update-student-course-registration.dto';
import { Student } from '@modules/core-data/students/entities/student.entity';
import { Course } from '../course/entities/course.entity';
import { ExamSession } from '../exam-session/entities/exam-session.entity';

@Injectable()
export class StudentCourseRegistrationsService {
  constructor(private readonly em: EntityManager) {}

  async create(
    dto: CreateStudentCourseRegistrationDto,
  ): Promise<StudentCourseRegistration> {
    // Check trùng: 1 SV không thể đăng ký 2 lần cùng course_id + exam_session_id
    const exists = await this.em.findOne(StudentCourseRegistration, {
      student: dto.student_id,
      course: dto.course_id,
      examSession: dto.exam_session_id,
      is_active: true,
    });

    if (exists) {
      throw new BadRequestException(
        'Sinh viên đã đăng ký môn này trong kỳ thi này',
      );
    }
    const student = this.em.getReference(Student, dto.student_id);
    const course = this.em.getReference(Course, dto.course_id);
    const examSession = this.em.getReference(ExamSession, dto.exam_session_id);

    const reg = this.em.create(StudentCourseRegistration, {
      student,
      course,
      examSession,
      is_active: dto.is_active ?? true,
    });
    await this.em.persistAndFlush(reg);
    await this.em.populate(reg, ['student', 'course', 'examSession']);
    return reg;
  }

  async findAll(): Promise<StudentCourseRegistration[]> {
    return this.em.find(StudentCourseRegistration, {});
  }

  async findOne(id: number): Promise<StudentCourseRegistration> {
    const reg = await this.em.findOne(StudentCourseRegistration, { id });
    if (!reg) throw new NotFoundException('Đăng ký không tồn tại');
    return reg;
  }

  async update(
    id: number,
    dto: UpdateStudentCourseRegistrationDto,
  ): Promise<StudentCourseRegistration> {
    const reg = await this.findOne(id);

    const cleanDto = Object.fromEntries(
      Object.entries(dto).filter(([_, v]) => v !== undefined),
    );

    this.em.assign(reg, cleanDto);
    await this.em.persistAndFlush(reg);
    return reg;
  }

  async remove(id: number): Promise<{ message: string }> {
    const reg = await this.findOne(id);
    await this.em.removeAndFlush(reg);
    return { message: 'Đã xóa đăng ký học phần' };
  }
}
