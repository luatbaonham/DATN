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
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { StudentFilterDto } from './dto/student-filter.dto';

@Injectable()
export class StudentService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateStudentDto): Promise<Student> {
    // check trùng mã sinh viên
    const existCode = await this.em.findOne(Student, {
      studentCode: dto.studentCode,
    });
    if (existCode) {
      throw new ConflictException('Mã sinh viên đã tồn tại!');
    }

    let user: User | undefined;
    if (dto.userId) {
      user = (await this.em.findOne(User, { id: dto.userId })) ?? undefined;
      if (!user) {
        throw new NotFoundException('Không tìm thấy user để gắn vào sinh viên');
      }

      // check nếu user này đã có hồ sơ student khác
      const existedStudent = await this.em.findOne(Student, { user });
      if (existedStudent) {
        throw new ConflictException('User này đã được gắn với sinh viên khác!');
      }
    }

    const student = this.em.create(Student, {
      studentCode: dto.studentCode,
      dateOfBirth: dto.dateOfBirth,
      gender: dto.gender,
      address: dto.address,
      phoneNumber: dto.phoneNumber,
      user,
    });

    await this.em.persistAndFlush(student);
    return student;
  }

  async findAll(
    filter: StudentFilterDto,
  ): Promise<PaginatedResponseDto<StudentResponseDto>> {
    const {
      page = 1,
      limit = 10,
      studentCode,
      fullName,
      email,
      classId,
      gender,
    } = filter;
    const offset = (page - 1) * limit;

    const qb = this.em
      .createQueryBuilder(Student, 's')
      .leftJoinAndSelect('s.user', 'u')
      .leftJoinAndSelect('s.class', 'c');

    // Lọc theo mã SV
    if (studentCode) {
      qb.andWhere({ studentCode: { $ilike: `%${studentCode}%` } });
    }

    // Lọc theo giới tính
    if (gender) {
      qb.andWhere({ gender });
    }

    // Lọc theo lớp
    if (classId) {
      qb.andWhere({ class: classId });
    }

    // Lọc theo họ tên (ghép họ + tên)
    if (fullName && fullName.trim() !== '') {
      qb.andWhere(
        `LOWER(CONCAT(u.last_name, ' ', u.first_name)) LIKE LOWER(?)`,
        [`%${fullName}%`],
      );
    }

    // Lọc theo email (nằm trong entity User)
    if (email && email.trim() !== '') {
      // qb.andWhere('u.email ILIKE ?', [`%${email}%`]); này là dùng cho postgres,
      qb.andWhere('LOWER(u.email) LIKE LOWER(?)', [`%${email}%`]); //này tương đương ILIKE, nhưng dùng đc cho Postgres, MySQL, SQLite.
      //ILIKE chỉ dùng đc cho postgres, còn mysql thì dùng LIKE
    }

    qb.orderBy({ 's.createAt': 'DESC' }).limit(limit).offset(offset);

    const [students, total] = await qb.getResultAndCount();

    const formatted = students.map((s) => ({
      id: s.id,
      studentCode: s.studentCode,
      firstName: s.user?.firstName ?? '',
      lastName: s.user?.lastName ?? '',
      email: s.user?.email ?? '',
      dateOfBirth: s.dateOfBirth,
      gender: s.gender,
      address: s.address,
      phoneNumber: s.phoneNumber,
      createdAt: s.createAt,
      updatedAt: s.updateAt,
    }));

    const mapped = plainToInstance(StudentResponseDto, formatted, {
      excludeExtraneousValues: true,
    });

    return PaginatedResponseDto.from(mapped, page, limit, total);
  }

  async findOne(id: number): Promise<Student | null> {
    return this.em.findOne(Student, { id }, { populate: ['user', 'class'] });
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
