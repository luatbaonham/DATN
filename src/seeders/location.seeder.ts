// src/seeders/location.seeder.ts
import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { Locations } from '@modules/algorithm-input/location/entities/locations.entity';

export class LocationSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const locations = [
      {
        code: 'CS001',
        name: 'Cơ sở Quận 1',
        address: 'Đa Kao, Quận 1, TP.HCM',
      },
      {
        code: 'CS002',
        name: 'Cơ sở Quận 9',
        address: '97 Man Thiện',
      },
    ];

    for (const data of locations) {
      const exist = await em.findOne(Locations, { code: data.code });
      if (!exist) {
        em.create(Locations, data);
      }
    }

    await em.flush();
  }
}
