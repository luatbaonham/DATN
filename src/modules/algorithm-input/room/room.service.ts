import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Locations } from '../location/entities/locations.entity';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { plainToInstance } from 'class-transformer';
import { RoomFilterDto } from './dto/room-filter.dto';
import { RoomResponseDto } from './dto/room-ressponse.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateRoomDto): Promise<any> {
    const exist = await this.em.findOne(Room, { code: dto.code });
    if (exist) throw new ConflictException('Mã phòng đã tồn tại!');

    const location = await this.em.findOne(Locations, dto.location_id); // lấy đầy đủ thông tin
    if (!location) throw new NotFoundException('Không tìm thấy địa điểm');

    const room = this.em.create(Room, {
      ...dto,
      location,
    });

    await this.em.persistAndFlush(room);

    // Trả về thông tin phòng + thông tin location gọn gàng
    return {
      id: room.id,
      code: room.code,
      capacity: room.capacity,
      type: room.type,
      is_active: room.is_active,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      location: {
        id: location.id,
        code: location.code,
        name: location.name,
        address: location.address,
      },
    };
  }

  // 🟡 Lấy danh sách phòng có filter
  async findAll(
    filter: RoomFilterDto,
  ): Promise<PaginatedResponseDto<RoomResponseDto>> {
    const {
      page = 1,
      limit = 10,
      code,
      locationName,
      capacity_min,
      capacity_max,
    } = filter;

    const offset = (page - 1) * limit;

    // ⚙️ Base Query
    const qb = this.em
      .createQueryBuilder(Room, 'r')
      .leftJoinAndSelect('r.location', 'l');

    // 🔍 Lọc theo mã phòng
    if (code) {
      qb.andWhere(`LOWER(r.code) LIKE LOWER(?)`, [`%${code}%`]);
    }

    // 📍 Lọc theo tên địa điểm
    if (locationName) {
      qb.andWhere(`LOWER(l.name) LIKE LOWER(?)`, [`%${locationName}%`]);
    }

    // 👥 Lọc theo sức chứa
    if (capacity_min && capacity_max) {
      qb.andWhere(`r.capacity BETWEEN ? AND ?`, [capacity_min, capacity_max]);
    } else if (capacity_min) {
      qb.andWhere(`r.capacity >= ?`, [capacity_min]);
    } else if (capacity_max) {
      qb.andWhere(`r.capacity <= ?`, [capacity_max]);
    }

    // 🧭 Sắp xếp + Phân trang
    qb.orderBy({ 'r.createdAt': 'DESC' }).limit(limit).offset(offset);

    // ⚡ Lấy dữ liệu
    const [rooms, total] = await qb.getResultAndCount();

    // 🔄 Map dữ liệu sang DTO (RoomResponseDto)
    const data = rooms.map((r) => ({
      id: r.id,
      code: r.code,
      capacity: r.capacity,
      type: r.type,
      is_active: r.is_active,
      location: r.location
        ? {
            id: r.location.id,
            name: r.location.name,
            address: r.location.address,
          }
        : null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    const mapped = plainToInstance(RoomResponseDto, data, {
      excludeExtraneousValues: true,
    });

    // 📦 Trả về dạng chuẩn
    return PaginatedResponseDto.from(mapped, page, limit, total);
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.em.findOne(Room, { id });
    if (!room) throw new NotFoundException('Không tìm thấy phòng');
    return room;
  }

  async update(id: number, dto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(id);
    this.em.assign(room, dto);
    await this.em.persistAndFlush(room);
    return room;
  }

  async remove(id: number): Promise<boolean> {
    const room = await this.em.findOne(Room, { id });
    if (!room) return false;
    await this.em.removeAndFlush(room);
    return true;
  }
}
