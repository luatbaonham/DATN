// class.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { Classes } from './entities/class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { Department } from '../departments/entities/department.entity';

@Injectable()
export class ClassService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateClassDto): Promise<Classes> {
    const existCode = await this.em.findOne(Classes, { classCode: dto.code });
    if (existCode) {
      throw new ConflictException('Mã lớp đã tồn tại!');
    }

    const department = await this.em.findOne(Department, {
      id: dto.departmentId,
    });
    if (!department) {
      throw new NotFoundException('Không tìm thấy khoa');
    }

    const classEntity = this.em.create(Classes, {
      className: dto.name,
      classCode: dto.code,
      department,
    });
    await this.em.persistAndFlush(classEntity);
    return classEntity;
  }

  async findAll(): Promise<Classes[]> {
    return this.em.find(Classes, {}, { populate: ['department'] });
  }

  async findOne(id: number): Promise<Classes | null> {
    return this.em.findOne(Classes, { id }, { populate: ['department'] });
  }

  async update(
    id: number,
    updateClassDto: UpdateClassDto,
  ): Promise<Classes | null> {
    const classEntity = await this.em.findOne(Classes, { id });
    if (!classEntity) {
      throw new NotFoundException('Không tìm thấy lớp học');
    }

    const cleanDto = Object.fromEntries(
      Object.entries(updateClassDto).filter(([_, v]) => v !== undefined),
    );

    if (cleanDto['code']) {
      const existCode = await this.em.findOne(Classes, {
        classCode: cleanDto['code'],
      });
      if (existCode && existCode.id !== id) {
        throw new ConflictException('Mã lớp đã tồn tại!');
      }
    }

    if (cleanDto['departmentId']) {
      const department = await this.em.findOne(Department, {
        id: cleanDto['departmentId'],
      });
      if (!department) {
        throw new NotFoundException('Không tìm thấy khoa');
      }
      cleanDto['department'] = department;
      delete cleanDto['departmentId'];
    }

    this.em.assign(classEntity, cleanDto);
    await this.em.persistAndFlush(classEntity);
    return classEntity;
  }

  async remove(id: number): Promise<boolean> {
    const classEntity = await this.em.findOne(Classes, { id });
    if (!classEntity) return false;

    await this.em.removeAndFlush(classEntity);
    return true;
  }
}
