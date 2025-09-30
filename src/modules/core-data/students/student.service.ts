// student.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(private readonly em: EntityManager) {}

  // hiện tại cái sinh viên khi tạo chưa cần có lớp với tài khoản, tùy biến sau này sửa
  async create(dto: CreateStudentDto): Promise<Student> {
    // check trùng mã sinh viên
    const existCode = await this.em.findOne(Student, {
      studentCode: dto.studentCode,
    });
    if (existCode) {
      throw new ConflictException('Mã sinh viên đã tồn tại!');
    }
    const student = this.em.create(Student, dto);
    await this.em.persistAndFlush(student);
    return student;
  }

  async findAll(): Promise<Student[]> {
    return this.em.find(Student, {});
  }

  async findOne(id: number): Promise<Student | null> {
    return this.em.findOne(Student, { id });
  }

  async update(id: number, dto: UpdateStudentDto): Promise<Student | null> {
    const student = await this.em.findOne(Student, { id });
    if (!student) {
      throw new NotFoundException('Không tìm thấy sinh viên');
    }

    const cleanDto = Object.fromEntries(
      Object.entries(dto).filter(([_, v]) => v !== undefined),
    );

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
