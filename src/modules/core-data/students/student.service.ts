import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { User } from '@modules/identity/users/entities/user.entity';
import { Classes } from '@modules/core-data/classes/entities/class.entity';

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

  async findAll(): Promise<Student[]> {
    return this.em.find(Student, {}, { populate: ['user', 'class'] });
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
