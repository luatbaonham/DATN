import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { ExamGroup } from '@modules/algorithm-input/exam-group/entities/exam-group.entity';
import { Room } from '@modules/algorithm-input/room/entities/room.entity';
import { ExamSlot } from '@modules/result/exam-slot/entities/exam-slot.entity';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';
import { ExamRegistration } from '@modules/result/exam-registration/entities/exam-registration.entity';
import { ExamSupervisor } from '@modules/result/exam-supervisor/entities/exam-supervisor.entity';
@Entity()
export class Exam {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => ExamGroup)
  examGroup!: ExamGroup;

  @ManyToOne(() => Room)
  room!: Room;

  @ManyToOne(() => ExamSlot)
  examSlot!: ExamSlot;

  @Property()
  examDate!: Date;

  @Property()
  duration!: number; // phút

  @Property()
  status?: string; // Dự thảo / Chốt / Đã công bố

  @OneToMany(() => ExamRegistration, (reg) => reg.exam)
  registrations = new Collection<ExamRegistration>(this);

  @OneToMany(() => ExamSupervisor, (sup) => sup.exam)
  supervisors = new Collection<ExamSupervisor>(this);

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
