// class.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, FilterQuery } from '@mikro-orm/mysql';
import { Classes } from './entities/class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { Department } from '../departments/entities/department.entity';
import { plainToInstance } from 'class-transformer';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { ClassFilterDto } from './dto/class-filter.dto';
import { ClassResponseDto } from './dto/class-response.dto';
import { AcademicYear } from '../academic-year/entities/academic-year.entity';

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

    const nam_nhap_hoc = await this.em.findOne(AcademicYear, {
      id: dto.id_nam_nhap_hoc,
    });
    if (!nam_nhap_hoc) {
      throw new NotFoundException('Không tìm thấy năm nhập học');
    }
    const classEntity = this.em.create(Classes, {
      className: dto.name,
      classCode: dto.code,
      department,
      nam_nhap_hoc,
    });
    await this.em.persistAndFlush(classEntity);
    return classEntity;
  }

  async findAll(
    filter: ClassFilterDto,
  ): Promise<PaginatedResponseDto<ClassResponseDto>> {
    const { page = 1, limit = 10, className, classCode } = filter;
    const offset = (page - 1) * limit;

    // --- Khởi tạo QueryBuilder ---
    const qb = this.em
      .createQueryBuilder(Classes, 'c')
      .leftJoinAndSelect('c.department', 'd');

    // --- Lọc theo tên lớp (không phân biệt hoa thường) ---
    if (className && className.trim() !== '') {
      qb.andWhere('LOWER(c.class_name) LIKE LOWER(?)', [`%${className}%`]);
    }

    // --- Lọc theo mã lớp ---
    if (classCode && classCode.trim() !== '') {
      qb.andWhere('LOWER(c.class_code) LIKE LOWER(?)', [`%${classCode}%`]);
    }

    // --- Sắp xếp, phân trang ---
    qb.orderBy({ createdAt: 'DESC' }).limit(limit).offset(offset);

    // --- Lấy kết quả và tổng ---
    const [data, total] = await qb.getResultAndCount();

    // --- Chuyển sang DTO ---
    const items = plainToInstance(ClassResponseDto, data, {
      excludeExtraneousValues: true,
    });

    // --- Trả kết quả phân trang ---
    return PaginatedResponseDto.from(items, page, limit, total);
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
