import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Collection,
  OneToMany,
} from '@mikro-orm/core';
import { Exam } from '@modules/result/exam/entities/exam.entity';

@Entity()
export class ExamSlot {
  @PrimaryKey()
  id!: number;

  @Property({ fieldName: 'slot_name' })
  slotName!: string;

  @Property({ fieldName: 'start_time' })
  startTime!: string; // HH:MM

  @Property({ fieldName: 'end_time' })
  endTime!: string; // HH:MM

  @Property({ nullable: true })
  description?: string;

  @OneToMany(() => Exam, (exam) => exam.examSlot)
  exam = new Collection<Exam>(this);

  @Property({ onCreate: () => new Date(), fieldName: 'created_at' })
  createdAt?: Date;

  @Property({
    onCreate: () => new Date(),
    onUpdate: () => new Date(),
    fieldName: 'updated_at',
  })
  updatedAt?: Date;
}
