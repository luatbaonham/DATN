import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { Locations } from './entities/locations.entity';
import { CreateLocationDto } from './dto/create-locations.dto';
import { UpdateLocationsDto } from './dto/update-locations.dto';
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

  async findAll(): Promise<Locations[]> {
    return this.em.find(Locations, {});
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
