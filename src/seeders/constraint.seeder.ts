import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/mysql';
import { Constraint } from '@modules/constraints/entities/constraint.entity';

export class ConstraintSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const constraints = [
      {
        constraintCode: 'HOLIDAY',
        description: 'Không thi vào các ngày lễ',
        type: 'CỨNG',
        scope: 'exam',
      },
      {
        constraintCode: 'AVOID_WEEKEND',
        description: 'Tránh xếp thi vào Thứ 7 hoặc Chủ Nhật',
        type: 'MỀM',
        scope: 'time',
      },
      {
        constraintCode: 'MAX_EXAMS_PER_DAY',
        description: 'Giới hạn số ca thi tối đa của mỗi sinh viên trong 1 ngày',
        type: 'CỨNG',
        scope: 'student',
      },
      {
        constraintCode: 'ROOM_LOCATION_LIMIT',
        description:
          'Giới hạn số lượng cơ sở tối đa mà sinh viên có thể thi trong cùng một ngày',
        type: 'MỀM',
        scope: 'student',
      },
    ];

    for (const c of constraints) {
      const existing = await em.findOne(Constraint, {
        constraintCode: c.constraintCode,
      });
      if (!existing) {
        const entity = em.create(Constraint, c);
        em.persist(entity);
      }
    }

    await em.flush();
    console.log(
      '✅ ConstraintSeeder: Seeded default constraints successfully!',
    );
  }
}
