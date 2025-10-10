// lecturer.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, t } from '@mikro-orm/mysql';
import { Lecturer } from './entities/lecturer.entity';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';
import { User } from '@modules/identity/users/entities/user.entity';
import { Department } from '../departments/entities/department.entity';
import { LecturerFilterDto } from './dto/lecturer-filter.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { LecturerResponseDto } from './dto/lecturer-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class LecturerService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateLecturerDto): Promise<Lecturer> {
    // ✅ 1. Check trùng mã
    const existCode = await this.em.findOne(Lecturer, {
      lecturerCode: dto.code,
    });
    if (existCode) {
      throw new ConflictException('Mã giảng viên đã tồn tại!');
    }

    // ✅ 2. Check user (nếu có)
    let user: User | undefined;
    if (dto.userId) {
      user = (await this.em.findOne(User, { id: dto.userId })) ?? undefined;
      if (!user) {
        throw new NotFoundException(
          'Không tìm thấy người dùng để gắn vào giảng viên',
        );
      }

      // check user đã có hồ sơ giảng viên chưa
      const existedLecturer = await this.em.findOne(Lecturer, { user });
      if (existedLecturer) {
        throw new ConflictException(
          'User này đã được gắn với hồ sơ giảng viên khác!',
        );
      }
    }

    // ✅ 3. Check department
    const department = await this.em.findOne(Department, {
      id: dto.departmentId,
    });
    if (!department) {
      throw new NotFoundException('Không tìm thấy khoa');
    }

    // ✅ 4. Tạo lecturer
    const lecturer = this.em.create(Lecturer, {
      lecturerCode: dto.code,
      user,
      department,
      isSupervisor: false,
    });

    await this.em.persistAndFlush(lecturer);
    return lecturer;
  }

  async findAll(
    filter: LecturerFilterDto,
  ): Promise<PaginatedResponseDto<LecturerResponseDto>> {
    const {
      page = 1,
      limit = 10,
      lecturerCode,
      departmentId,
      fullName,
      email,
    } = filter;
    const offset = (page - 1) * limit;
    const qb = this.em
      .createQueryBuilder(Lecturer, 'l')
      .leftJoinAndSelect('l.user', 'u')
      .leftJoinAndSelect('l.department', 'd');
    // filter by lecturerCode
    if (lecturerCode) {
      qb.andWhere({ lecturerCode: { $ilike: `%${lecturerCode}%` } });
    }
    //
    if (departmentId) {
      qb.andWhere({ department: departmentId });
    }
    //
    if (fullName && fullName.trim() !== '') {
      qb.andWhere(`LOWER(CONCAT(u.last_name,' '.u.first_name)) LIKE LOWER(?)`, [
        `%${fullName}%`,
      ]);
    }
    //
    if (email && email.trim() !== '') {
      qb.andWhere('LOWER(u.email)LIKE LOWER(?)', [`%${email}%`]);
    }

    qb.orderBy({ 'l.createdAt': 'DESC' }).limit(limit).offset(offset);

    const [lecturer, total] = await qb.getResultAndCount();
    const formatted = lecturer.map((l) => ({
      id: l.id,
      lecturerCode: l.lecturerCode,
      firstName: l.user?.firstName ?? '',
      lastName: l.user?.lastName ?? '',
      email: l.user?.email ?? '',
      departmentId: l.department ?? '',
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
    }));

    const mapped = plainToInstance(LecturerResponseDto, formatted, {
      excludeExtraneousValues: true,
    });

    return PaginatedResponseDto.from(mapped, page, limit, total);
  }

  async findOne(id: number): Promise<Lecturer | null> {
    return this.em.findOne(
      Lecturer,
      { id },
      { populate: ['user', 'department'] },
    );
  }

  async update(
    id: number,
    updateLecturerDto: UpdateLecturerDto,
  ): Promise<Lecturer | null> {
    const lecturer = await this.em.findOne(Lecturer, { id });
    if (!lecturer) {
      throw new NotFoundException('Không tìm thấy hồ sơ giảng viên');
    }

    const cleanDto = Object.fromEntries(
      Object.entries(updateLecturerDto).filter(([_, v]) => v !== undefined),
    );

    if (cleanDto['code']) {
      const existCode = await this.em.findOne(Lecturer, {
        lecturerCode: cleanDto['code'],
      });
      if (existCode && existCode.id !== id) {
        throw new ConflictException('Mã giảng viên đã tồn tại!');
      }
    }

    if (cleanDto['userId']) {
      const user = await this.em.findOne(User, { id: cleanDto['userId'] });
      if (!user) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }
      const existLecturer = await this.em.findOne(Lecturer, { user });
      if (existLecturer && existLecturer.id !== id) {
        throw new ConflictException('Người dùng đã có hồ sơ giảng viên khác!');
      }
      cleanDto['user'] = user;
      delete cleanDto['userId'];
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

    this.em.assign(lecturer, cleanDto);
    await this.em.persistAndFlush(lecturer);
    return lecturer;
  }

  async remove(id: number): Promise<boolean> {
    const lecturer = await this.em.findOne(Lecturer, { id });
    if (!lecturer) return false;

    await this.em.removeAndFlush(lecturer);
    return true;
  }
}
