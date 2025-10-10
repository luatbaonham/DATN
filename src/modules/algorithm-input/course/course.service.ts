// course.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, FilterQuery } from '@mikro-orm/mysql';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseFilterDto } from './dto/course-filter.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { CourseResponseDto } from './dto/course-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CourseService {
  constructor(private readonly em: EntityManager) {}

  // Tạo mới môn học
  async create(dto: CreateCourseDto): Promise<Course> {
    // check trùng mã môn học
    const existCode = await this.em.findOne(Course, {
      codeCourse: dto.codeCourse,
    });
    if (existCode) {
      throw new ConflictException('Mã môn học đã tồn tại!');
    }
    const course = this.em.create(Course, dto);
    await this.em.persistAndFlush(course);
    return course;
  }

  // Lấy tất cả môn học
  async findAll(
    filter: CourseFilterDto,
  ): Promise<PaginatedResponseDto<CourseResponseDto>> {
    const { page = 1, limit = 10, codeCourse, nameCourse, credits } = filter;
    const offset = (page - 1) * limit;

    // 🎯 Tạo điều kiện filter đơn giản
    const where: FilterQuery<Course> = {};

    if (codeCourse) {
      // LIKE không phân biệt hoa thường (chạy tốt cho MySQL utf8_general_ci)
      where.codeCourse = { $like: `%${codeCourse}%` };
    }

    if (nameCourse) {
      where.nameCourse = { $like: `%${nameCourse}%` };
    }

    if (credits) {
      where.credits = credits;
    }

    // ⚡ Lấy dữ liệu + đếm tổng
    const [courses, total] = await this.em.findAndCount(Course, where, {
      limit,
      offset,
      orderBy: { createAt: 'DESC' },
    });

    // 🔄 Map sang DTO
    const mapped = plainToInstance(CourseResponseDto, courses, {
      excludeExtraneousValues: true,
    });

    // 📦 Trả về dạng chuẩn
    return PaginatedResponseDto.from(mapped, page, limit, total);
  }

  // Lấy 1 môn học theo ID
  async findOne(id: number): Promise<Course | null> {
    return this.em.findOne(Course, { id });
  }

  // Cập nhật môn học
  async update(id: number, dto: UpdateCourseDto): Promise<Course | null> {
    const course = await this.em.findOne(Course, { id });
    if (!course) {
      throw new NotFoundException('Không tìm thấy môn học');
    }

    const cleanDto = Object.fromEntries(
      Object.entries(dto).filter(([_, v]) => v !== undefined),
    );

    this.em.assign(course, cleanDto);
    await this.em.persistAndFlush(course);
    return course;
  }

  // Xoá môn học
  async remove(id: number): Promise<boolean> {
    const course = await this.em.findOne(Course, { id });
    if (!course) return false;

    await this.em.removeAndFlush(course);
    return true;
  }
}
