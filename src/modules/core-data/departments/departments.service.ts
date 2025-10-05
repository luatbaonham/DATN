// department.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Locations } from '@modules/algorithm-input/location/entities/locations.entity';

@Injectable()
export class DepartmentService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateDepartmentDto): Promise<Department> {
    const existCode = await this.em.findOne(Department, {
      departmentCode: dto.departmentCode,
    });
    if (existCode) {
      throw new ConflictException('Mã khoa đã tồn tại!');
    }

    const existName = await this.em.findOne(Department, {
      departmentName: dto.departmentName,
    });
    if (existName) {
      throw new ConflictException('Tên khoa đã tồn tại!');
    }

    const location = await this.em.getReference(Locations, dto.location_id);

    const department = this.em.create(Department, {
      ...dto,
      location,
    });
    await this.em.persistAndFlush(department);
    return department;
  }

  async findAll(): Promise<Department[]> {
    return this.em.find(Department, {});
  }

  async findOne(id: number): Promise<Department | null> {
    return this.em.findOne(Department, { id });
  }

  async update(
    id: number,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department | null> {
    const department = await this.em.findOne(Department, { id });
    if (!department) {
      throw new NotFoundException('Không tìm thấy khoa');
    }

    const cleanDto = Object.fromEntries(
      Object.entries(updateDepartmentDto).filter(([_, v]) => v !== undefined),
    );

    if (cleanDto['code']) {
      const existCode = await this.em.findOne(Department, {
        departmentCode: cleanDto['code'],
      });
      if (existCode && existCode.id !== id) {
        throw new ConflictException('Mã khoa đã tồn tại!');
      }
    }

    if (cleanDto['name']) {
      const existName = await this.em.findOne(Department, {
        departmentName: cleanDto['name'],
      });
      if (existName && existName.id !== id) {
        throw new ConflictException('Tên khoa đã tồn tại!');
      }
    }

    this.em.assign(department, cleanDto);
    await this.em.persistAndFlush(department);
    return department;
  }

  async remove(id: number): Promise<boolean> {
    const department = await this.em.findOne(Department, { id });
    if (!department) return false;

    await this.em.removeAndFlush(department);
    return true;
  }
}
