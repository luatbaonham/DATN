import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { ExamSlot } from '@modules/result/exam-slot/entities/exam-slot.entity';

export class ExamSlotSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const slots = [
      {
        slotName: 'Ca sáng',
        startTime: '07:30',
        endTime: '09:30',
        description: 'Thi buổi sáng',
      },
      {
        slotName: 'Ca giữa',
        startTime: '09:45',
        endTime: '11:45',
        description: 'Thi giữa buổi sáng',
      },
      {
        slotName: 'Ca chiều',
        startTime: '13:00',
        endTime: '15:00',
        description: 'Thi buổi chiều',
      },
      {
        slotName: 'Ca tối',
        startTime: '18:00',
        endTime: '20:00',
        description: 'Thi buổi tối',
      },
    ];

    for (const data of slots) {
      const exist = await em.findOne(ExamSlot, { slotName: data.slotName });
      if (!exist) {
        em.create(ExamSlot, data);
      }
    }

    await em.flush();
    console.log('✅ ExamSlotSeeder completed');
  }
}
