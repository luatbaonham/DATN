// lecturer.service.ts
import {
  BadRequestException,
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
import { ImportLecturerDto } from './dto/import-lecturer.dto';
import { Role } from '@modules/identity/roles-permissions/entities/role.entity';
import { UserRole } from '@modules/identity/users/entities/user-role.entity';
import { validate } from 'class-validator';

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
    errors: Array<{ row: number; error: string; data?: any }>;
  }> {
    try {
      // Đọc file Excel
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
      });

      if (!rawData || rawData.length === 0) {
        throw new BadRequestException('File Excel/CSV trống hoặc không hợp lệ');
      }

      let imported = 0;
      let failed = 0;
      const errors: Array<{ row: number; error: string; data?: any }> = [];

      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const rowNumber = i + 2; // Dòng 2 trở đi (vì header là dòng 1)

        try {
          // 1️⃣ Map dữ liệu từ Excel → DTO
          const dto = new ImportLecturerDto();
          dto.lecturerCode = row['Mã giảng viên']?.toString().trim() || '';
          dto.lastName = row['Họ']?.toString().trim() || '';
          dto.firstName = row['Tên']?.toString().trim() || '';
          dto.dateOfBirth = this.parseExcelDate(row['Ngày sinh']) || '';
          dto.gender = (row['Giới tính']?.toString().toLowerCase().trim() ||
            'male') as 'male' | 'female' | 'other';
          dto.address = row['Địa chỉ']?.toString().trim() || '';
          dto.phoneNumber = row['Số điện thoại']?.toString().trim() || '';
          const isSupervisorValue =
            row['Giám thị']?.toString().toLowerCase().trim() || 'false';
          dto.isSupervisor =
            isSupervisorValue === 'true' || isSupervisorValue === '1';
          dto.departmentName = row['Tên khoa']?.toString().trim() || '';

          // 2️⃣ Validate DTO
          const validationErrors = await validate(dto);
          if (validationErrors.length > 0) {
            throw new Error(
              validationErrors
                .map((err) => Object.values(err.constraints || {}))
                .flat()
                .join(', '),
            );
          }

          // 3️⃣ Check trùng mã giảng viên
          const existingByCode = await this.em.findOne(Lecturer, {
            lecturerCode: dto.lecturerCode,
          });
          if (existingByCode) {
            errors.push({
              row: rowNumber,
              error: `Mã giảng viên ${dto.lecturerCode} đã tồn tại`,
              data: row,
            });
            failed++;
            continue;
          }

          // 4️⃣ Tìm khoa dựa theo tên
          const departmentEntity = await this.em.findOne(Department, {
            departmentName: dto.departmentName,
          });
          if (!departmentEntity) {
            throw new Error(
              `Không tìm thấy khoa với tên ${dto.departmentName}`,
            );
          }

          // 5️⃣ Xử lý User và Role
          const email =
            row['Email']?.toString().trim() ||
            `${dto.lecturerCode.toLowerCase()}@lecturer.ptithcm.vn`;

          let user = await this.em.findOne(User, { email });
          if (!user) {
            user = this.em.create(User, {
              email,
              password: await bcrypt.hash('123456@Abc', 10),
            });
            await this.em.persistAndFlush(user);

            const role = await this.em.findOne(Role, { name: 'GIANG_VIEN' });
            if (!role)
              throw new NotFoundException('Không tìm thấy role GIANG_VIEN');

            const userRole = this.em.create(UserRole, { user, role });
            await this.em.persistAndFlush(userRole);
          } else {
            const existingLecturer = await this.em.findOne(Lecturer, { user });
            if (existingLecturer) {
              throw new Error(`User này đã gắn với giảng viên khác`);
            }
          }

          // 6️⃣ Tạo Lecturer
          const lecturer = this.em.create(Lecturer, {
            lecturerCode: dto.lecturerCode,
            firstName: dto.firstName,
            lastName: dto.lastName,
            dateOfBirth: new Date(dto.dateOfBirth),
            gender: dto.gender,
            address: dto.address,
            phoneNumber: dto.phoneNumber,
            isSupervisor: dto.isSupervisor ?? false,
            user,
            department: departmentEntity,
          });
          await this.em.persistAndFlush(lecturer);
          imported++;
        } catch (error) {
          failed++;
          const errorMessage =
            error instanceof Error ? error.message : 'Lỗi không xác định';
          errors.push({ row: rowNumber, error: errorMessage, data: row });
        }
      }

      return { imported, failed, errors };
    } catch (error) {
      throw error;
    }
  }

  private parseExcelDate(excelDate: any): string {
    if (typeof excelDate === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(excelDate)) return excelDate;
      const date = new Date(excelDate);
      if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
    } else if (typeof excelDate === 'number') {
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
    }
    throw new Error('Ngày sinh không hợp lệ');
  }
}
