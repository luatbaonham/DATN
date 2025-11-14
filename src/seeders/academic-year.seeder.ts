import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { AcademicYear } from '@modules/core-data/academic-year/entities/academic-year.entity';

export class AcademicYearSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const academicYears = [
      {
        name: '2023-2024',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2024-06-30'),
      },
      {
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
      },
      {
        name: '2025-2026',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-06-30'),
      },
    ];

    for (const year of academicYears) {
      const exists = await em.findOne(AcademicYear, { name: year.name });
      if (!exists) {
        em.create(AcademicYear, year);
      }
    }

    await em.flush();
  }
}
