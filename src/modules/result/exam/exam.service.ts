import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { Exam } from './entities/exam.entity';
import { ExamFilterDto } from './dto/exam-filter.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { plainToInstance } from 'class-transformer';
import { ExamResponseDto } from './dto/exam-response.dto';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';
import { ExamGroup } from '@modules/algorithm-input/exam-group/entities/exam-group.entity';
import { Room } from '@modules/algorithm-input/room/entities/room.entity';
import { ExamSlot } from '@modules/result/exam-slot/entities/exam-slot.entity';

@Injectable()
export class ExamService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateExamDto): Promise<Exam> {
    const [examGroup, room, examSlot] = await Promise.all([
      this.em.findOne(ExamGroup, { id: dto.examGroupId }),
      this.em.findOne(Room, { id: dto.roomId }),
      this.em.findOne(ExamSlot, { id: dto.examSlotId }),
    ]);

    if (!examGroup) throw new NotFoundException('Không tìm thấy nhóm thi');
    if (!room) throw new NotFoundException('Không tìm thấy phòng thi');
    if (!examSlot) throw new NotFoundException('Không tìm thấy ca thi');

    const exam = this.em.create(Exam, {
      examGroup,
      room,
      examSlot,
      examDate: new Date(dto.examDate),
      duration: dto.duration,
      status: dto.status,
    });

    await this.em.persistAndFlush(exam);
    return exam;
  }

  async findAll(
    filter: ExamFilterDto,
  ): Promise<PaginatedResponseDto<ExamResponseDto>> {
    const { page = 1, limit = 10, status, examGroupName, roomName } = filter;
    const offset = (page - 1) * limit;

    const qb = this.em
      .createQueryBuilder(Exam, 'e')
      .leftJoinAndSelect('e.examSession', 'es')
      .leftJoinAndSelect('e.examGroup', 'eg')
      .leftJoinAndSelect('e.room', 'r')
      .leftJoinAndSelect('e.examSlot', 's');

    if (status) qb.andWhere({ status });
    if (examGroupName)
      qb.andWhere('LOWER(eg.name) LIKE LOWER(?)', [`%${examGroupName}%`]);
    if (roomName) qb.andWhere('LOWER(r.name) LIKE LOWER(?)', [`%${roomName}%`]);

    qb.orderBy({ createdAt: 'DESC' }).limit(limit).offset(offset);

    const [data, total] = await qb.getResultAndCount();
    const items = plainToInstance(ExamResponseDto, data, {
      excludeExtraneousValues: true,
    });

    return PaginatedResponseDto.from(items, page, limit, total);
  }

  async findOne(id: number): Promise<Exam> {
    const exam = await this.em.findOne(
      Exam,
      { id },
      { populate: ['examGroup', 'room', 'examSlot'] },
    );
    if (!exam) throw new NotFoundException('Không tìm thấy kỳ thi');
    return exam;
  }

  async update(id: number, dto: UpdateExamDto): Promise<Exam> {
    const exam = await this.em.findOne(Exam, { id });
    if (!exam) throw new NotFoundException('Không tìm thấy kỳ thi');

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
    if (cleanDto['examGroupId']) {
      const group = await this.em.findOne(ExamGroup, {
        id: cleanDto['examGroupId'],
      });
      if (!group) throw new NotFoundException('Không tìm thấy nhóm thi');
      cleanDto['examGroup'] = group;
      delete cleanDto['examGroupId'];
    }
    if (cleanDto['roomId']) {
      const room = await this.em.findOne(Room, { id: cleanDto['roomId'] });
      if (!room) throw new NotFoundException('Không tìm thấy phòng thi');
      cleanDto['room'] = room;
      delete cleanDto['roomId'];
    }
    if (cleanDto['examSlotId']) {
      const slot = await this.em.findOne(ExamSlot, {
        id: cleanDto['examSlotId'],
      });
      if (!slot) throw new NotFoundException('Không tìm thấy ca thi');
      cleanDto['examSlot'] = slot;
      delete cleanDto['examSlotId'];
    }

    this.em.assign(exam, cleanDto);
    await this.em.persistAndFlush(exam);
    return exam;
  }

  async remove(id: number): Promise<boolean> {
    const exam = await this.em.findOne(Exam, { id });
    if (!exam) return false;
    await this.em.removeAndFlush(exam);
    return true;
  }
}
