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
      { departmentCode: 'KT', departmentName: 'Kinh tế', location },
      { departmentCode: 'SP', departmentName: 'Sư phạm', location },
      { departmentCode: 'NN', departmentName: 'Ngoại ngữ', location },
      { departmentCode: 'LS', departmentName: 'Lịch sử', location },
      { departmentCode: 'DL', departmentName: 'Du lịch', location },
      {
        departmentCode: 'TCNH',
        departmentName: 'Tài chính - Ngân hàng',
        location,
      },
      { departmentCode: 'KTMT', departmentName: 'Kỹ thuật máy tính', location },
      {
        departmentCode: 'QTKD',
        departmentName: 'Quản trị kinh doanh',
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
