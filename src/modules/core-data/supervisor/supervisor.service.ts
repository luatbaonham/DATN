// supervisor.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { Supervisor } from './entities/supervisor.entity';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';
import { Lecturer } from '../lecturer/entities/lecturer.entity';
@Injectable()
export class SupervisorService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateSupervisorDto): Promise<Supervisor> {
    const existCode = await this.em.findOne(Supervisor, { code: dto.code });
    if (existCode) {
      throw new ConflictException('Mã giám thị đã tồn tại!');
    }

    const lecturer = await this.em.findOne(Lecturer, { id: dto.lecturerId });
    if (!lecturer) {
      throw new NotFoundException('Không tìm thấy giảng viên');
    }

    const existSupervisor = await this.em.findOne(Supervisor, { lecturer });
    if (existSupervisor) {
      throw new ConflictException('Giảng viên đã có hồ sơ giám thị!');
    }

    const supervisor = this.em.create(Supervisor, {
      code: dto.code,
      lecturer,
    });
    await this.em.persistAndFlush(supervisor);
    return supervisor;
  }

  async findAll(): Promise<Supervisor[]> {
    return this.em.find(
      Supervisor,
      {},
      { populate: ['lecturer', 'lecturer.user', 'lecturer.department'] },
    );
  }

  async findOne(id: number): Promise<Supervisor | null> {
    return this.em.findOne(
      Supervisor,
      { id },
      { populate: ['lecturer', 'lecturer.user', 'lecturer.department'] },
    );
  }

  async update(
    id: number,
    updateSupervisorDto: UpdateSupervisorDto,
  ): Promise<Supervisor | null> {
    const supervisor = await this.em.findOne(Supervisor, { id });
    if (!supervisor) {
      throw new NotFoundException('Không tìm thấy hồ sơ giám thị');
    }

    const cleanDto = Object.fromEntries(
      Object.entries(updateSupervisorDto).filter(([_, v]) => v !== undefined),
    );

    if (cleanDto['code']) {
      const existCode = await this.em.findOne(Supervisor, {
        code: cleanDto['code'],
      });
      if (existCode && existCode.id !== id) {
        throw new ConflictException('Mã giám thị đã tồn tại!');
      }
    }

    if (cleanDto['lecturerId']) {
      const lecturer = await this.em.findOne(Lecturer, {
        id: cleanDto['lecturerId'],
      });
      if (!lecturer) {
        throw new NotFoundException('Không tìm thấy giảng viên');
      }
      const existSupervisor = await this.em.findOne(Supervisor, { lecturer });
      if (existSupervisor && existSupervisor.id !== id) {
        throw new ConflictException('Giảng viên đã có hồ sơ giám thị khác!');
      }
      cleanDto['lecturer'] = lecturer;
      delete cleanDto['lecturerId'];
    }

    this.em.assign(supervisor, cleanDto);
    await this.em.persistAndFlush(supervisor);
    return supervisor;
  }

  async remove(id: number): Promise<boolean> {
    const supervisor = await this.em.findOne(Supervisor, { id });
    if (!supervisor) return false;

    await this.em.removeAndFlush(supervisor);
    return true;
  }
}
