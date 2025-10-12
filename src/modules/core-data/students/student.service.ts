import {
  ConflictException,
  Injectable,
  NotFoundException,
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
}
