import { EntityManager } from '@mikro-orm/mysql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExamSupervisorDto } from './dto/create-exam-supervisor.dto';
import { Lecturer } from '@modules/core-data/lecturer/entities/lecturer.entity';
import { Exam } from '../exam/entities/exam.entity';
import { ExamSupervisor } from './entities/exam-supervisor.entity';
import { ExamSupervisorResponseDto } from './dto/exam-supervisor-response.dto';
import { ExamSupervisorFilterDto } from './dto/exam-supervisor-filter.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateExamSupervisorDto } from './dto/update-exam-supervisor.dto';

@Injectable()
export class ExamSupervisorService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateExamSupervisorDto): Promise<ExamSupervisor> {
    const exam = await this.em.findOne(Exam, { id: dto.examId });
    if (!exam) throw new NotFoundException('Không tìm thấy kỳ thi');
    const lecturer = await this.em.findOne(Lecturer, { id: dto.lecturerId });
    if (!lecturer) throw new NotFoundException('Không tìm thấy giảng viên');
    const supervisor = this.em.create(ExamSupervisor, {
      exam,
      lecturer,
      role: dto.role,
    });
    await this.em.persistAndFlush(supervisor);
    return supervisor;
  }

  async findAll(
    filter: ExamSupervisorFilterDto,
  ): Promise<PaginatedResponseDto<ExamSupervisorResponseDto>> {
    const { page = 1, limit = 10 } = filter;
    const offset = (page - 1) * limit;

    const qb = this.em
      .createQueryBuilder(ExamSupervisor, 'es')
      .leftJoinAndSelect('es.exam', 'exam')
      .leftJoinAndSelect('es.lecturer', 'lecturer');

    qb.orderBy({ createdAt: 'DESC' }).limit(limit).offset(offset);

    const [data, total] = await qb.getResultAndCount();
    const items = plainToInstance(ExamSupervisorResponseDto, data, {
      excludeExtraneousValues: true,
    });
    return PaginatedResponseDto.from(items, page, limit, total);
  }

  async findOne(id: number): Promise<ExamSupervisor> {
    const supervisor = await this.em.findOne(
      ExamSupervisor,
      { id },
      { populate: ['exam', 'lecturer'] },
    );
    if (!supervisor)
      throw new NotFoundException('Không tìm thấy giám thị kỳ thi');
    return supervisor;
  }

  async update(
    id: number,
    dto: UpdateExamSupervisorDto,
  ): Promise<ExamSupervisor> {
    const supervisor = await this.em.findOne(ExamSupervisor, { id });
    if (!supervisor)
      throw new NotFoundException('Không tìm thấy giám thị kỳ thi');
    const cleanDto = Object.fromEntries(
      Object.entries(dto).filter(([_, v]) => v !== undefined),
    );
    if (cleanDto['examId']) {
      const exam = await this.em.findOne(Exam, { id: cleanDto['examId'] });
      if (!exam) throw new NotFoundException('Không tìm thấy kỳ thi');
      cleanDto['exam'] = exam;
      delete cleanDto['examId'];
    }
    if (cleanDto['lecturerId']) {
      const lecturer = await this.em.findOne(Lecturer, {
        id: cleanDto['lecturerId'],
      });
      if (!lecturer) throw new NotFoundException('Không tìm thấy giảng viên');
      cleanDto['lecturer'] = lecturer;
      delete cleanDto['lecturerId'];
    }

    this.em.assign(supervisor, cleanDto);
    await this.em.persistAndFlush(supervisor);
    return supervisor;
  }

  async remove(id: number): Promise<boolean> {
    const supervisor = await this.em.findOne(ExamSupervisor, { id });
    if (!supervisor)
      throw new NotFoundException('Không tìm thấy giám thị kỳ thi');
    await this.em.removeAndFlush(supervisor);
    return true;
  }
}
