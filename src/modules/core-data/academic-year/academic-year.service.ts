import { EntityManager, FilterQuery } from '@mikro-orm/mysql';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { AcademicYear } from './entities/academic-year.entity';
import { AcademicYearFilterDto } from './dto/academic-year-filter.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { AcademicYearResponseDto } from './dto/academic-year-response.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@Injectable()
export class AcademicYearService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateAcademicYearDto): Promise<AcademicYear> {
    if (dto.startDate >= dto.endDate) {
      throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
    }

    const exist = await this.em.count(AcademicYear, { name: dto.name });
    if (exist > 0) {
      throw new ConflictException('Niên khóa đã tồn tại');
    }
    const academicYear = this.em.create(AcademicYear, dto);
    await this.em.persistAndFlush(academicYear);
    return academicYear;
  }

  async findAll(
    filter: AcademicYearFilterDto,
  ): Promise<PaginatedResponseDto<AcademicYearResponseDto>> {
    const { page = 1, limit = 10, name } = filter;
    const offset = (page - 1) * limit;

    const where: FilterQuery<AcademicYear> = {};

    if (name) {
      where.name = { $like: `%${name}` };
    }

    const [academicYear, total] = await this.em.findAndCount(
      AcademicYear,
      where,
      {
        limit,
        offset,
        orderBy: { createdAt: 'DESC' },
      },
    );

    const mapped = plainToInstance(AcademicYearResponseDto, academicYear, {
      excludeExtraneousValues: true,
    });
    return PaginatedResponseDto.from(mapped, page, limit, total);
  }

  async findOne(id: number): Promise<AcademicYear> {
    const academicYear = await this.em.findOne(AcademicYear, { id });
    if (!academicYear) {
      throw new NotFoundException('Không tìm thấy niên khóa');
    }
    return academicYear;
  }

  async update(id: number, dto: UpdateAcademicYearDto): Promise<AcademicYear> {
    const academicYear = await this.findOne(id);
    if (dto.startDate && dto.endDate && dto.startDate >= dto.endDate) {
      throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
    }

    const cleanDto = Object.fromEntries(
      Object.entries(dto).filter(([_, v]) => v !== undefined),
    );

    this.em.assign(academicYear, cleanDto);
    await this.em.persistAndFlush(academicYear);
    return academicYear;
  }

  async remove(id: number): Promise<boolean> {
    const academicYear = await this.em.findOne(AcademicYear, { id });
    if (!academicYear) return false;
    await this.em.removeAndFlush(academicYear);
    return true;
  }
}
