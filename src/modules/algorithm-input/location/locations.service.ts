import { map } from 'rxjs/operators';
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EntityManager, FilterQuery } from '@mikro-orm/mysql';
import { Locations } from './entities/locations.entity';
import { CreateLocationDto } from './dto/create-locations.dto';
import { UpdateLocationsDto } from './dto/update-locations.dto';
import { LocationsFilterDto } from './dto/locations-filter.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { LocationResponseDto } from './dto/locations-response.dto';
import { plainToInstance } from 'class-transformer';
@Injectable()
export class LocationsService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateLocationDto): Promise<Locations> {
    const exist = await this.em.findOne(Locations, { code: dto.code });
    if (exist) throw new ConflictException('Mã cơ sở đã tồn tại!');
    const location = this.em.create(Locations, dto);
    await this.em.persistAndFlush(location);
    return location;
  }

  async findAll(
    filter: LocationsFilterDto,
  ): Promise<PaginatedResponseDto<LocationResponseDto>> {
    const { page = 1, limit = 10, code, name } = filter;
    const offset = (page - 1) * limit;

    const where: FilterQuery<Locations> = {};

    if (code) {
      where.code = { $like: `%${code}%` };
    }
    if (name) {
      where.name = { $like: `%${name}%` };
    }

    const [locations, total] = await this.em.findAndCount(Locations, where, {
      limit,
      offset,
      orderBy: { createAt: 'DESC' },
    });

    const mapped = plainToInstance(LocationResponseDto, locations, {
      excludeExtraneousValues: true,
    });
    return PaginatedResponseDto.from(mapped, page, limit, total);
  }

  async findOne(id: number): Promise<Locations> {
    const location = await this.em.findOne(Locations, { id });
    if (!location) throw new NotFoundException('Không tìm thấy cơ sở');
    return location;
  }

  async update(id: number, dto: UpdateLocationsDto): Promise<Locations> {
    const location = await this.findOne(id);
    this.em.assign(location, dto);
    await this.em.persistAndFlush(location);
    return location;
  }

  async remove(id: number): Promise<boolean> {
    const location = await this.em.findOne(Locations, { id });
    if (!location) return false;
    await this.em.removeAndFlush(location);
    return true;
  }
}
