import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { Classes } from '@modules/core-data/classes/entities/class.entity';
import { Department } from '@modules/core-data/departments/entities/department.entity';

export class ClassSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const department = await em.findOne(Department, { departmentCode: 'CNTT' });
    if (!department) return;

    const classes = [
      { classCode: 'CNTT01', className: 'Công nghệ thông tin 01', department },
      { classCode: 'CNTT02', className: 'Công nghệ thông tin 02', department },
    ];

    for (const data of classes) {
      const exist = await em.findOne(Classes, { classCode: data.classCode });
      if (!exist) {
        em.create(Classes, data);
      }
    }

    await em.flush();
  }
}
