import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { Classes } from '@modules/core-data/classes/entities/class.entity';
import { Department } from '@modules/core-data/departments/entities/department.entity';
import { AcademicYear } from '@modules/core-data/academic-year/entities/academic-year.entity';

export class ClassSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const departmentCodes = ['CNTT', 'KHTN', 'KT', 'SP', 'NN'];

    const classDefinitions = {
      CNTT: [
        { classCode: 'CNTT01', className: 'Công nghệ thông tin 01' },
        { classCode: 'CNTT02', className: 'Công nghệ thông tin 02' },
        { classCode: 'CNTT03', className: 'Công nghệ thông tin 03' },
      ],
      KHTN: [
        { classCode: 'KHTN01', className: 'Khoa học tự nhiên 01' },
        { classCode: 'KHTN02', className: 'Khoa học tự nhiên 02' },
        { classCode: 'KHTN03', className: 'Khoa học tự nhiên 03' },
      ],
      KT: [
        { classCode: 'KT01', className: 'Kinh tế 01' },
        { classCode: 'KT02', className: 'Kinh tế 02' },
        { classCode: 'KT03', className: 'Kinh tế 03' },
      ],
      SP: [
        { classCode: 'SP01', className: 'Sư phạm 01' },
        { classCode: 'SP02', className: 'Sư phạm 02' },
        { classCode: 'SP03', className: 'Sư phạm 03' },
      ],
      NN: [
        { classCode: 'NN01', className: 'Ngoại ngữ 01' },
        { classCode: 'NN02', className: 'Ngoại ngữ 02' },
        { classCode: 'NN03', className: 'Ngoại ngữ 03' },
      ],
    };

    // Lấy năm học mặc định (ví dụ: 2025-2026)
    const academicYear = await em.findOne(AcademicYear, { name: '2025-2026' });
    if (!academicYear) {
      throw new Error(
        'Không tìm thấy năm học "2025-2026". Hãy chạy AcademicYearSeeder trước.',
      );
    }

    for (const code of departmentCodes) {
      const department = await em.findOne(Department, { departmentCode: code });
      if (!department) continue;

      const classes = classDefinitions[code];
      for (const data of classes) {
        const exist = await em.findOne(Classes, { classCode: data.classCode });
        if (!exist) {
          em.create(Classes, {
            ...data,
            department,
            nam_nhap_hoc: academicYear,
          });
        }
      }
    }

    await em.flush();
  }
}
