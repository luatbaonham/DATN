import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, FilterQuery } from '@mikro-orm/mysql';
import { CourseDepartment } from './entities/course-department.entity';
import { CreateCourseDepartmentDto } from './dto/create-course-department.dto';
import { UpdateCourseDepartmentDto } from './dto/update-course-department.dto';
import { CourseDepartmentFilterDto } from './dto/course-department-filter.dto';
import { Course } from '@modules/algorithm-input/course/entities/course.entity';
import { Department } from '@modules/core-data/departments/entities/department.entity';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';
import { plainToInstance } from 'class-transformer';
import { CourseDepartmentResponseDto } from './dto/course-department-response.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';

@Injectable()
export class CourseDepartmentService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateCourseDepartmentDto): Promise<CourseDepartment> {
    const { courseId, departmentId, examSessionId, isCompulsory } = dto;

    const [course, department, examSession] = await Promise.all([
      this.em.findOne(Course, { id: courseId }),
      this.em.findOne(Department, { id: departmentId }),
      this.em.findOne(ExamSession, { id: examSessionId }),
    ]);

    if (!course) throw new NotFoundException('Không tìm thấy môn học');
    if (!department) throw new NotFoundException('Không tìm thấy khoa');
    if (!examSession) throw new NotFoundException('Không tìm thấy đợt thi');

    const existed = await this.em.findOne(CourseDepartment, {
      course,
      department,
      examSession,
    });

    if (existed)
      throw new ConflictException('Môn này đã được khoa mở trong đợt thi này.');

    const courseDepartment = this.em.create(CourseDepartment, {
      course,
      department,
      examSession,
      isCompulsory,
      isActive: true,
    });

    await this.em.persistAndFlush(courseDepartment);
    return courseDepartment;
  }

  async findAll(filter: CourseDepartmentFilterDto) {
    const { page = 1, limit = 10 } = filter;
    const offset = (page - 1) * limit;

    const [records, total] = await this.em.findAndCount(
      CourseDepartment,
      {},
      {
        populate: ['course', 'department', 'examSession'] as const,
        limit,
        offset,
        orderBy: { createdAt: 'DESC' },
      },
    );

    const mapped = records.map((r) =>
      plainToInstance(CourseDepartmentResponseDto, {
        id: r.id,
        courseName: r.course.nameCourse,
        departmentName: r.department.departmentName,
        examSessionName: r.examSession.name,
        isCompulsory: r.isCompulsory,
        isActive: r.isActive,
        createdAt: r.createdAt,
      }),
    );

    return PaginatedResponseDto.from(mapped, page, limit, total);
  }

  async findOne(id: number): Promise<CourseDepartment> {
    const record = await this.em.findOne(
      CourseDepartment,
      { id },
      { populate: ['course', 'department', 'examSession'] },
    );
    if (!record) throw new NotFoundException('Không tìm thấy bản ghi');
    return record;
  }

  async update(
    id: number,
    dto: UpdateCourseDepartmentDto,
  ): Promise<CourseDepartment> {
    const record = await this.findOne(id);

    const cleanDto = Object.fromEntries(
      Object.entries(dto).filter(([_, v]) => v !== undefined),
    );

    this.em.assign(record, cleanDto);
    await this.em.persistAndFlush(record);
    return record;
  }

  async remove(id: number): Promise<boolean> {
    const record = await this.em.findOne(CourseDepartment, { id });
    if (!record) return false;
    await this.em.removeAndFlush(record);
    return true;
  }
}
