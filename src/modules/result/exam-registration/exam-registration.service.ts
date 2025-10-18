import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { ExamRegistration } from './entities/exam-registration.entity';
import { CreateExamRegistrationDto } from './dto/create-exam-registration.dto';
import { UpdateExamRegistrationDto } from './dto/update-exam-registration.dto';
import { ExamRegistrationFilterDto } from './dto/exam-registration-filter.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { ExamRegistrationResponseDto } from './dto/exam-registration-response.dto';
import { plainToInstance } from 'class-transformer';
import { Student } from '@modules/core-data/students/entities/student.entity';
import { Exam } from '../exam/entities/exam.entity';

@Injectable()
export class ExamRegistrationService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateExamRegistrationDto): Promise<ExamRegistration> {
    const exam = await this.em.findOne(Exam, { id: dto.examId });
    if (!exam) throw new NotFoundException('Không tìm thấy bài thi');

    const student = await this.em.findOne(Student, { id: dto.studentId });
    if (!student) throw new NotFoundException('Không tìm thấy sinh viên');

    const reg = this.em.create(ExamRegistration, {
      exam,
      student,
    });

    await this.em.persistAndFlush(reg);
    return reg;
  }

  async findAll(
    filter: ExamRegistrationFilterDto,
  ): Promise<PaginatedResponseDto<ExamRegistrationResponseDto>> {
    const { page = 1, limit = 10 } = filter;
    const offset = (page - 1) * limit;

    const qb = this.em
      .createQueryBuilder(ExamRegistration, 'er')
      .leftJoinAndSelect('er.exam', 'exam')
      .leftJoinAndSelect('er.student', 'student')
      .orderBy({ createdAt: 'DESC' })
      .limit(limit)
      .offset(offset);

    const [data, total] = await qb.getResultAndCount();

    const items = plainToInstance(ExamRegistrationResponseDto, data, {
      excludeExtraneousValues: true,
    });

    return PaginatedResponseDto.from(items, page, limit, total);
  }

  async findOne(id: number): Promise<ExamRegistration> {
    const reg = await this.em.findOne(
      ExamRegistration,
      { id },
      { populate: ['exam', 'student'] },
    );
    if (!reg) throw new NotFoundException('Không tìm thấy đăng ký thi');
    return reg;
  }

  async update(
    id: number,
    dto: UpdateExamRegistrationDto,
  ): Promise<ExamRegistration> {
    const reg = await this.em.findOne(ExamRegistration, { id });
    if (!reg) throw new NotFoundException('Không tìm thấy đăng ký thi');

    const cleanDto = Object.fromEntries(
      Object.entries(dto).filter(([_, v]) => v !== undefined),
    );

    if (cleanDto['examId']) {
      const exam = await this.em.findOne(Exam, { id: cleanDto['examId'] });
      if (!exam) throw new NotFoundException('Không tìm thấy bài thi');
      cleanDto['exam'] = exam;
      delete cleanDto['examId'];
    }

    if (cleanDto['studentId']) {
      const student = await this.em.findOne(Student, {
        id: cleanDto['studentId'],
      });
      if (!student) throw new NotFoundException('Không tìm thấy sinh viên');
      cleanDto['student'] = student;
      delete cleanDto['studentId'];
    }

    this.em.assign(reg, cleanDto);
    await this.em.persistAndFlush(reg);
    return reg;
  }

  async remove(id: number): Promise<boolean> {
    const reg = await this.em.findOne(ExamRegistration, { id });
    if (!reg) return false;
    await this.em.removeAndFlush(reg);
    return true;
  }
}
