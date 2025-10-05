// src/seeders/user.seeder.ts
import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { User } from '@modules/identity/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export class UserSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const users = [
      {
        firstName: 'Nguyễn Văn',
        lastName: 'An',
        email: 'nguyenvana@example.com',
        password: await bcrypt.hash('123456', 10),
      },
      {
        firstName: 'Trần Thị',
        lastName: 'Ân',
        email: 'tranthib@example.com',
        password: await bcrypt.hash('abcdef', 10),
      },
    ];

    for (const data of users) {
      const exist = await em.findOne(User, { email: data.email });
      if (!exist) {
        em.create(User, data);
      }
    }

    await em.flush();
  }
}
