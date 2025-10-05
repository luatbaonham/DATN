import { EntityManager } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ExamGroup } from './entities/exam-group.entity';
import { CreateExamGroupDto } from './dto/create-exam-group.dto';
import { UpdateExamGroupDto } from './dto/update-exam-group.dto';
import { Course } from '../course/entities/course.entity';
import { ExamSession } from '../exam-session/entities/exam-session.entity';

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

  async findAll(): Promise<ExamGroup[]> {
    return this.em.find(ExamGroup, {});
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
