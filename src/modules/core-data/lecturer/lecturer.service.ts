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
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as bcrypt from 'bcrypt';
import { ImportLecturerDto } from './dto/import-lecturer.dto';
import { Role } from '@modules/identity/roles-permissions/entities/role.entity';
import { UserRole } from '@modules/identity/users/entities/user-role.entity';

@Injectable()
export class LecturerService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateLecturerDto): Promise<Lecturer> {
    // 1️⃣ Kiểm tra trùng mã giảng viên
    const existCode = await this.em.findOne(Lecturer, {
      lecturerCode: dto.lecturerCode,
    });
    if (existCode) {
      throw new ConflictException('Mã giảng viên đã tồn tại!');
    }

    // 2️⃣ Kiểm tra khoa (department) tồn tại
    const department = await this.em.findOne(Department, {
      id: dto.departmentId,
    });
    if (!department) {
      throw new NotFoundException('Không tìm thấy khoa!');
    }

    // 3️⃣ Xử lý user (tự tạo nếu không có)
    let user: User;
    if (dto.userId) {
      user = await this.em.findOneOrFail(User, { id: dto.userId });
      const existedLecturer = await this.em.findOne(Lecturer, { user });
      if (existedLecturer) {
        throw new ConflictException('User đã gắn với giảng viên khác!');
      }
    } else {
      const defaultEmail = `${dto.lecturerCode.toLowerCase()}@lecturer.ptithcm.vn`;
      const defaultPassword = dto.lecturerCode;
      user = this.em.create(User, {
        email: defaultEmail,
        password: await bcrypt.hash(defaultPassword, 10),
      });
      await this.em.persistAndFlush(user);

      // 🔹 Gắn role GIANG_VIEN (qua bảng UserRole)
      const role = await this.em.findOne(Role, { name: 'GIANG_VIEN' });
      if (!role) {
        throw new NotFoundException('Không tìm thấy role GIANG_VIEN');
      }

      const userRole = this.em.create(UserRole, {
        user,
        role, // ✅ truyền entity role
      });
      await this.em.persistAndFlush(userRole);
    }

    // 4️⃣ Tạo giảng viên
    const lecturer = this.em.create(Lecturer, {
      lecturerCode: dto.lecturerCode,
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateOfBirth: dto.dateOfBirth,
      address: dto.address,
      gender: dto.gender,
      phoneNumber: dto.phoneNumber,
      user,
      department,
      isSupervisor: dto.isSupervisor ?? false,
    });

    await this.em.persistAndFlush(lecturer);
    await this.em.populate(lecturer, ['department', 'user.userRoles.role']);
    return lecturer;
  }
  async findAll(
    filter: LecturerFilterDto,
  ): Promise<PaginatedResponseDto<LecturerResponseDto>> {
    const {
      page = 1,
      limit = 10,
      lecturerCode,
      fullName,
      email,
      gender,
    } = filter;
    const offset = (page - 1) * limit;
    const qb = this.em
      .createQueryBuilder(Lecturer, 'l')
      .leftJoinAndSelect('l.user', 'u')
      .leftJoinAndSelect('u.userRoles', 'ur')
      .leftJoinAndSelect('ur.role', 'r')
      .leftJoinAndSelect('l.department', 'd');
    // filter by lecturerCode
    if (lecturerCode) {
      qb.andWhere({ lecturerCode: { $like: `%${lecturerCode}%` } });
    }
    //
    if (gender) {
      qb.andWhere({ gender: { $like: `%${gender}%` } });
    }
    //
    if (fullName && fullName.trim() !== '') {
      qb.andWhere(`LOWER(CONCAT(u.last_name,' '.u.first_name)) LIKE LOWER(?)`, [
        `%${fullName}%`,
      ]);
    }

    if (email && email.trim() !== '') {
      qb.andWhere('LOWER(u.email)LIKE LOWER(?)', [`%${email}%`]);
    }

    qb.orderBy({ 'l.createdAt': 'DESC' }).limit(limit).offset(offset);

    const [lecturer, total] = await qb.getResultAndCount();
    const formatted = lecturer.map((l) => ({
      id: l.id,
      lecturerCode: l.lecturerCode,
      firstName: l.firstName ?? '',
      lastName: l.lastName ?? '',
      email: l.user?.email ?? '',
      gender: l.gender ?? '',
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

  async importFromExcel(filePath: string): Promise<{
    imported: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
  }> {
    try {
      // Read Excel file
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const errors: Array<{ row: number; error: string }> = [];
      let imported = 0;
      let failed = 0;

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any;
        const rowNumber = i + 2; // Excel rows start at 1, header is row 1

        try {
          // Map Excel columns to DTO
          const dto: ImportLecturerDto = {
            lecturerCode: row['Mã giảng viên']?.toString().trim(),
            firstName: row['Họ']?.toString().trim(),
            lastName: row['Tên']?.toString().trim(),
            email: row['Email']?.toString().trim(),
            departmentId: row['Mã khoa'] ? Number(row['Mã khoa']) : undefined,
            isSupervisor:
              row['Giám thị']?.toString().toLowerCase() === 'true' ||
              row['Giám thị'] === true,
          };

          // Check duplicate lecturerCode
          const existingByCode = await this.em.findOne(Lecturer, {
            lecturerCode: dto.lecturerCode,
          });
          if (existingByCode) {
            errors.push({
              row: rowNumber,
              error: `Mã giảng viên ${dto.lecturerCode} đã tồn tại`,
            });
            failed++;
            continue;
          }

          // Check duplicate email if provided
          if (dto.email) {
            const existingUser = await this.em.findOne(User, {
              email: dto.email,
            });
            if (existingUser) {
              errors.push({
                row: rowNumber,
                error: `Email ${dto.email} đã tồn tại`,
              });
              failed++;
              continue;
            }
          }

          // Get department if provided
          let department: Department | undefined;
          if (dto.departmentId) {
            department =
              (await this.em.findOne(Department, { id: dto.departmentId })) ??
              undefined;
            if (!department) {
              errors.push({
                row: rowNumber,
                error: `Không tìm thấy khoa với ID ${dto.departmentId}`,
              });
              failed++;
              continue;
            }
          }

          // Create User if email provided
          let user: User | undefined;
          if (dto.email) {
            user = this.em.create(User, {
              email: dto.email,
              password: await bcrypt.hash('123456', 10), // Default password
              firstName: dto.firstName,
              lastName: dto.lastName,
            });
            await this.em.persistAndFlush(user);
          }

          // Create Lecturer
          const lecturerData: any = {
            lecturerCode: dto.lecturerCode,
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            isSupervisor: dto.isSupervisor ?? false,
          };

          if (user) {
            lecturerData.user = user;
          }

          if (department) {
            lecturerData.department = department;
          }

          const lecturer = this.em.create(Lecturer, lecturerData);

          await this.em.persistAndFlush(lecturer);
          imported++;
        } catch (error) {
          errors.push({
            row: rowNumber,
            error:
              error instanceof Error
                ? error.message
                : 'Lỗi không xác định khi xử lý dòng',
          });
          failed++;
        }
      }

      return { imported, failed, errors };
    } finally {
      // Clean up uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }
}
