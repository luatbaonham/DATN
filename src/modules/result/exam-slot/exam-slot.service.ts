import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { ExamSlot } from './entities/exam-slot.entity';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';
import { CreateExamSlotDto } from './dto/create-exam-slot.dto';
import { UpdateExamSlotDto } from './dto/update-exam-slot.dto';
import { ExamSlotFilterDto } from './dto/exam-slot-filter.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { ExamSlotResponseDto } from './dto/exam-slot-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ExamSlotService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateExamSlotDto): Promise<ExamSlot> {
    const slot = this.em.create(ExamSlot, {
      slotName: dto.slotName,
      startTime: dto.startTime,
      endTime: dto.endTime,
      description: dto.description,
    });

    await this.em.persistAndFlush(slot);
    return slot;
  }

  async findAll(
    filter: ExamSlotFilterDto,
  ): Promise<PaginatedResponseDto<ExamSlotResponseDto>> {
    const { page = 1, limit = 10, slotName } = filter;
    const offset = (page - 1) * limit;

    const qb = this.em
      .createQueryBuilder(ExamSlot, 'es')
      .leftJoinAndSelect('es.examSession', 'session');

    if (slotName)
      qb.andWhere('LOWER(es.slot_name) LIKE LOWER(?)', [`%${slotName}%`]);

    qb.orderBy({ createdAt: 'DESC' }).limit(limit).offset(offset);

    const [data, total] = await qb.getResultAndCount();
    const items = plainToInstance(ExamSlotResponseDto, data, {
      excludeExtraneousValues: true,
    });

    return PaginatedResponseDto.from(items, page, limit, total);
  }

  async findOne(id: number): Promise<ExamSlot> {
    const slot = await this.em.findOne(ExamSlot, { id });
    if (!slot) throw new NotFoundException('Không tìm thấy ca thi');
    return slot;
  }

  async update(id: number, dto: UpdateExamSlotDto): Promise<ExamSlot> {
    const slot = await this.em.findOne(ExamSlot, { id });
    if (!slot) throw new NotFoundException('Không tìm thấy ca thi');

    const cleanDto = Object.fromEntries(
      Object.entries(dto).filter(([_, v]) => v !== undefined),
    );

    if (cleanDto['examSessionId']) {
      const session = await this.em.findOne(ExamSession, {
        id: cleanDto['examSessionId'],
      });
      if (!session) throw new NotFoundException('Không tìm thấy đợt thi');
      cleanDto['examSession'] = session;
      delete cleanDto['examSessionId'];
    }

    this.em.assign(slot, cleanDto);
    await this.em.persistAndFlush(slot);
    return slot;
  }

  async remove(id: number): Promise<boolean> {
    const slot = await this.em.findOne(ExamSlot, { id });
    if (!slot) throw new NotFoundException('Không tìm thấy ca thi');
    await this.em.removeAndFlush(slot);
    return true;
  }
}
