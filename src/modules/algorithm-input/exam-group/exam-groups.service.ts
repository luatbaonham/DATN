import { EntityManager } from '@mikro-orm/mysql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ExamGroup } from './entities/exam-group.entity';
import { CreateExamGroupDto } from './dto/create-exam-group.dto';
import { UpdateExamGroupDto } from './dto/update-exam-group.dto';
import { Course } from '../course/entities/course.entity';
import { ExamSession } from '../exam-session/entities/exam-session.entity';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { ExamGroupResponseDto } from './dto/exam-group-response.dto';
import { plainToInstance } from 'class-transformer';
import { ExamGroupFilterDto } from './dto/exam-group-filter.dto';

@Injectable()
export class ExamGroupsService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateExamGroupDto): Promise<ExamGroup> {
    const course = await this.em.getReference(Course, dto.course_id);
    const examSession = await this.em.getReference(
      ExamSession,
      dto.exam_session_id,
    );

    const examGroup = this.em.create(ExamGroup, {
      ...dto,
      status: dto.status ?? 'not scheduled',
      course,
      examSession,
    });
    await this.em.persistAndFlush(examGroup);
    return examGroup;
  }

  async findAll(
    filter: ExamGroupFilterDto,
  ): Promise<PaginatedResponseDto<ExamGroupResponseDto>> {
    const { page = 1, limit = 10 } = filter;
    const offset = (page - 1) * limit;

    const qb = this.em
      .createQueryBuilder(ExamGroup, 'eg')
      .leftJoinAndSelect('eg.course', 'course')
      .leftJoinAndSelect('eg.examSession', 'examSession');
    qb.orderBy({ createdAt: 'DESC' }).limit(limit).offset(offset);
    const [data, total] = await qb.getResultAndCount();
    const items = plainToInstance(ExamGroupResponseDto, data, {
      excludeExtraneousValues: true,
    });
    return PaginatedResponseDto.from(items, page, limit, total);
  }

  async findOne(id: number): Promise<ExamGroup> {
    const examGroup = await this.em.findOne(ExamGroup, { id });
    if (!examGroup) throw new NotFoundException('Exam group not found');
    return examGroup;
  }

  async update(id: number, dto: UpdateExamGroupDto): Promise<ExamGroup> {
    const examGroup = await this.findOne(id);
    this.em.assign(examGroup, dto);
    await this.em.flush();
    return examGroup;
  }

  async remove(id: number): Promise<boolean> {
    const examGroup = await this.findOne(id);
    await this.em.removeAndFlush(examGroup);
    return true;
  }
}
