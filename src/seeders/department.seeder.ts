import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { Department } from '@modules/core-data/departments/entities/department.entity';
import { Locations } from '@modules/algorithm-input/location/entities/locations.entity';

export class DepartmentSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const location = await em.findOne(Locations, { code: 'CS001' });
    if (!location) return;

    const departments = [
      { departmentCode: 'KHTN', departmentName: 'Khoa học tự nhiên', location },
      {
        departmentCode: 'CNTT',
        departmentName: 'Công nghệ thông tin',
        location,
      },
    ];

    for (const data of departments) {
      const exist = await em.findOne(Department, {
        departmentCode: data.departmentCode,
      });
      if (!exist) {
        em.create(Department, data);
      }
    }

    await em.flush();
  }
}
