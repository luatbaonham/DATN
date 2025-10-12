import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { Room } from '@modules/algorithm-input/room/entities/room.entity';
import { Locations } from '@modules/algorithm-input/location/entities/locations.entity';

export class RoomSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const location = await em.findOne(Locations, { code: 'CS001' });
    if (!location) return;

    const rooms = [
      { code: 'P101', capacity: 40, is_active: true, type: 'LT', location },
      { code: 'LAB01', capacity: 30, is_active: true, type: 'Lab', location },
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
