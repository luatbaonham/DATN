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
      createAt: room.createAt,
      updateAt: room.updateAt,
      location: {
        id: location.id,
        code: location.code,
        name: location.name,
        address: location.address,
      },
    };
  }

  async findAll(): Promise<Room[]> {
    return this.em.find(Room, {});
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
