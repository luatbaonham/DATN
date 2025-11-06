import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { Room } from '@modules/algorithm-input/room/entities/room.entity';
import { Locations } from '@modules/algorithm-input/location/entities/locations.entity';

export class RoomSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const location = await em.findOne(Locations, { code: 'CS001' });
    if (!location) return;

    const rooms = [
      // Phòng lý thuyết
      { code: 'P101', capacity: 40, is_active: true, type: 'LT', location },
      { code: 'P102', capacity: 45, is_active: true, type: 'LT', location },
      { code: 'P201', capacity: 50, is_active: true, type: 'LT', location },
      { code: 'P202', capacity: 60, is_active: true, type: 'LT', location },
      { code: 'P301', capacity: 40, is_active: true, type: 'LT', location },
      { code: 'P302', capacity: 55, is_active: true, type: 'LT', location },

      // Phòng máy (Lab)
      { code: 'LAB01', capacity: 30, is_active: true, type: 'Lab', location },
      { code: 'LAB02', capacity: 35, is_active: true, type: 'Lab', location },
      { code: 'LAB03', capacity: 40, is_active: true, type: 'Lab', location },
      { code: 'LAB04', capacity: 25, is_active: true, type: 'Lab', location },
      { code: 'LAB05', capacity: 30, is_active: true, type: 'Lab', location },

      // Hội trường / phòng đặc biệt
      { code: 'HT101', capacity: 100, is_active: true, type: 'LT', location },
      { code: 'P401', capacity: 80, is_active: true, type: 'LT', location },
    ];

    for (const data of rooms) {
      const exist = await em.findOne(Room, { code: data.code });
      if (!exist) {
        em.create(Room, data);
      }
    }

    await em.flush();
  }
}
