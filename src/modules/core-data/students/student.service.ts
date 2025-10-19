import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager, FilterQuery } from '@mikro-orm/mysql';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { User } from '@modules/identity/users/entities/user.entity';
import { Classes } from '@modules/core-data/classes/entities/class.entity';
import { StudentResponseDto } from './dto/student-response.dto';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { StudentFilterDto } from './dto/student-filter.dto';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { UserRole } from '@modules/identity/users/entities/user-role.entity';
import { Role } from '@modules/identity/roles-permissions/entities/role.entity';

@Injectable()
export class StudentService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateStudentDto): Promise<Student> {
    // 1️⃣ Kiểm tra trùng mã sinh viên
    const existCode = await this.em.findOne(Student, {
      studentCode: dto.studentCode,
    });
    if (existCode) {
      throw new ConflictException('Mã sinh viên đã tồn tại!');
    }

    // 2️⃣ Kiểm tra lớp tồn tại
    const classEntity = await this.em.findOne(Classes, { id: dto.classId });
    if (!classEntity) {
      throw new NotFoundException('Không tìm thấy lớp học!');
    }

    // 3️⃣ Xử lý user (tự tạo nếu không có)
    let user: User;
    if (dto.userId) {
      user = await this.em.findOneOrFail(User, { id: dto.userId });
      const existedStudent = await this.em.findOne(Student, { user });
      if (existedStudent)
        throw new ConflictException('User đã gắn với sinh viên khác!');
    } else {
      const defaultEmail = `${dto.studentCode.toLowerCase()}@edu.ptithcm.vn`;
      const defaultPassword = dto.studentCode;
      user = this.em.create(User, {
        email: defaultEmail,
        password: await bcrypt.hash(defaultPassword, 10),
      });
      await this.em.persistAndFlush(user);
      // 🔹 Gắn role STUDENT (qua bảng UserRole)
      const role = await this.em.findOne(Role, { name: 'SINH_VIEN' });
      if (!role) throw new NotFoundException('Không tìm thấy role STUDENT');

      const userRole = this.em.create(UserRole, {
        user,
        role, // ✅ Truyền entity role
      });
      await this.em.persistAndFlush(userRole);
    }

    // 4️⃣ Tạo sinh viên
    const student = this.em.create(Student, {
      studentCode: dto.studentCode,
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateOfBirth: dto.dateOfBirth,
      gender: dto.gender,
      address: dto.address,
      phoneNumber: dto.phoneNumber,
      user,
      classes: classEntity,
    });

    await this.em.persistAndFlush(student);
    await this.em.populate(student, ['classes', 'user']);
    return student;
  }

  async findAll(
    filter: StudentFilterDto,
  ): Promise<PaginatedResponseDto<StudentResponseDto>> {
    const { page = 1, limit = 10, studentCode, gender, className } = filter;
    const offset = (page - 1) * limit;

    const qb = this.em
      .createQueryBuilder(Student, 's')
      .leftJoinAndSelect('s.user', 'u')
      .leftJoinAndSelect('s.classes', 'c');

    if (studentCode)
      qb.andWhere({ studentCode: { $like: `%${studentCode}%` } });
    if (gender) qb.andWhere({ gender });
    if (className) qb.andWhere({ 'c.className': { $like: `%${className}%` } });

    qb.orderBy({ 's.createdAt': 'DESC' }).limit(limit).offset(offset);

    const [students, total] = await qb.getResultAndCount();

    const formatted = students.map((s) => ({
      id: s.id,
      studentCode: s.studentCode,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.user?.email ?? '',
      dateOfBirth: s.dateOfBirth,
      gender: s.gender,
      address: s.address,
      phoneNumber: s.phoneNumber,
      classes: {
        id: s.classes.id,
        classCode: s.classes.classCode,
        className: s.classes.className,
      },
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    const mapped = plainToInstance(StudentResponseDto, formatted, {
      excludeExtraneousValues: true,
    });

    return PaginatedResponseDto.from(mapped, page, limit, total);
  }

  async findOne(id: number): Promise<Student | null> {
    return this.em.findOne(Student, { id }, { populate: ['user', 'classes'] });
  }

  async update(id: number, dto: UpdateStudentDto): Promise<Student | null> {
    const student = await this.em.findOne(Student, { id });
    if (!student) throw new NotFoundException('Không tìm thấy sinh viên');

    const cleanDto = Object.fromEntries(
      Object.entries(dto).filter(([_, v]) => v !== undefined),
    );

    if (cleanDto['userId']) {
      const user = await this.em.findOne(User, { id: cleanDto['userId'] });
      if (!user) throw new NotFoundException('Không tìm thấy user');
      const existedStudent = await this.em.findOne(Student, { user });
      if (existedStudent && existedStudent.id !== id) {
        throw new ConflictException('User đã gắn với sinh viên khác!');
      }
      cleanDto['user'] = user;
      delete cleanDto['userId'];
    }

    this.em.assign(student, cleanDto);
    await this.em.persistAndFlush(student);
    return student;
  }

  async remove(id: number): Promise<boolean> {
    const student = await this.em.findOne(Student, { id });
    if (!student) return false;
    await this.em.removeAndFlush(student);
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

      // Chuyển đổi sang JSON
      const rawData: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (!rawData || rawData.length === 0) {
        throw new BadRequestException('File Excel trống hoặc không hợp lệ');
      }

      let imported = 0;
      let failed = 0;
      const errors: Array<{ row: number; error: string; data?: any }> = [];

      // Xử lý từng dòng
      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const rowNumber = i + 2; // +2 vì dòng 1 là header, index bắt đầu từ 0

        try {
          // Map dữ liệu từ Excel
          const studentCode = row['Mã sinh viên']?.toString().trim();
          const dateOfBirthRaw = row['Ngày sinh'];
          const genderRaw = row['Giới tính']?.toString().toLowerCase().trim();
          const address = row['Địa chỉ']?.toString().trim();
          const phoneNumber = row['Số điện thoại']?.toString().trim();

          // Validate dữ liệu cơ bản
          if (!studentCode) {
            throw new Error('Mã sinh viên không được để trống');
          }

          // Parse date of birth
          const dateOfBirth = dateOfBirthRaw
            ? this.parseExcelDate(dateOfBirthRaw)
            : new Date().toISOString().split('T')[0];

          // Validate gender
          const gender =
            genderRaw === 'male' || genderRaw === 'female' ? genderRaw : 'male';

          // Kiểm tra trùng mã sinh viên
          const existingStudent = await this.em.findOne(Student, {
            studentCode,
          });

          if (existingStudent) {
            throw new Error(`Mã sinh viên ${studentCode} đã tồn tại`);
          }

          // Tìm hoặc tạo User
          const email = row['Email']?.toString().trim();
          const firstName = row['Tên']?.toString().trim();
          const lastName = row['Họ']?.toString().trim();

          let user: User | null = null;

          if (email) {
            // Kiểm tra xem email đã tồn tại chưa
            user = await this.em.findOne(User, { email });

            if (!user && firstName && lastName) {
              // Tạo user mới nếu có đủ thông tin
              user = this.em.create(User, {
                email,
                password: 'defaultPassword123', // Password mặc định, nên thay đổi sau
              });
              await this.em.persistAndFlush(user);
            }
          }

          // Tạo sinh viên với dữ liệu đã validate
          // const student = this.em.create(Student, {
          //   studentCode,
          //   dateOfBirth,
          //   gender,
          //   address: address || '',
          //   phoneNumber: phoneNumber || '',
          //   user: user ?? undefined,
          // });

          // await this.em.persistAndFlush(student);
          imported++;
        } catch (error) {
          failed++;
          const errorMessage =
            error instanceof Error ? error.message : 'Lỗi không xác định';
          errors.push({
            row: rowNumber,
            error: errorMessage,
            data: row,
          });
        }
      }

      // Xóa file sau khi xử lý
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Không thể xóa file:', err);
      }

      return {
        imported,
        failed,
        errors,
      };
    } catch (error) {
      // Xóa file nếu có lỗi
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Không thể xóa file:', err);
      }
      throw error;
    }
  }

  // Helper function để parse date từ Excel
  private parseExcelDate(excelDate: any): string {
    if (typeof excelDate === 'string') {
      // Nếu đã là string dạng YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(excelDate)) {
        return excelDate;
      }
      // Parse các định dạng khác
      const date = new Date(excelDate);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } else if (typeof excelDate === 'number') {
      // Excel serial date number
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  }
}
