import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { StudentExamGroup } from './entities/student-exam-group.entity';
import { CreateStudentExamGroupDto } from './dto/create-student-exam-group.dto';
import { UpdateStudentExamGroupDto } from './dto/update-student-exam-group.dto';
import { Student } from '@modules/core-data/students/entities/student.entity';
import { ExamGroup } from '../exam-group/entities/exam-group.entity';

@Injectable()
export class StudentExamGroupsService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateStudentExamGroupDto): Promise<StudentExamGroup> {
    const student = this.em.getReference(Student, dto.student_id);
    const examGroup = this.em.getReference(ExamGroup, dto.exam_group_id);

    const entity = this.em.create(StudentExamGroup, {
      student,
      examGroup,
      is_active: dto.is_active ?? true,
    });
    await this.em.persistAndFlush(entity);
    return entity;
  }

  async findAll(): Promise<StudentExamGroup[]> {
    return this.em.find(
      StudentExamGroup,
      {},
      { populate: ['student', 'examGroup'] },
    );
  }

  async findOne(id: number): Promise<StudentExamGroup> {
    const entity = await this.em.findOne(
      StudentExamGroup,
      { id },
      { populate: ['student', 'examGroup'] },
    );
    if (!entity)
      throw new NotFoundException(`StudentExamGroup #${id} not found`);
    return entity;
  }

  async update(
    id: number,
    dto: UpdateStudentExamGroupDto,
  ): Promise<StudentExamGroup> {
    const entity = await this.em.findOne(StudentExamGroup, { id });
    if (!entity)
      throw new NotFoundException(`StudentExamGroup #${id} not found`);

    this.em.assign(entity, dto);
    await this.em.persistAndFlush(entity);
    return entity;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.em.findOne(StudentExamGroup, { id });
    if (!entity)
      throw new NotFoundException(`StudentExamGroup #${id} not found`);

    // thực tế chỉ set inactive thay vì xóa cứng
    entity.is_active = false;
    await this.em.persistAndFlush(entity);
    return true;
  }
}
