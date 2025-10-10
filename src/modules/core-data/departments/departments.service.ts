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
import { DepartmentFilterDto } from './dto/department-filter.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';
import { plainToInstance } from 'class-transformer';

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

  async findAll(
    filter: DepartmentFilterDto,
  ): Promise<PaginatedResponseDto<DepartmentResponseDto>> {
    const { page = 1, limit = 10, departmentCode, departmentName } = filter;
    const offset = (page - 1) * limit;

    const qb = this.em.createQueryBuilder(Department, 'd');
    if (departmentCode && departmentCode.trim() !== '') {
      qb.andWhere('LOWER(d.department_code) LIKE LOWER(?)', [
        `%${departmentCode}%`,
      ]);
    }

    if (departmentName && departmentName.trim() !== '') {
      qb.andWhere('LOWER(d.department_name) LIKE LOWER(?)', [
        `%${departmentName}%`,
      ]);
    }

    qb.orderBy({ createAt: 'DESC' }).limit(limit).offset(offset);

    const [data, total] = await qb.getResultAndCount();

    const items = plainToInstance(DepartmentResponseDto, data, {
      excludeExtraneousValues: true,
    });

    // --- Trả kết quả phân trang ---
    return PaginatedResponseDto.from(items, total, page, limit);
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
