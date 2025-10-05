import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { ExamSession } from './entities/exam-session.entity';
import { CreateExamSessionDto } from './dto/create-exam-session.dto';
import { UpdateExamSessionDto } from './dto/update-exam-session.dto';
import { Locations } from '../location/entities/locations.entity';

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
