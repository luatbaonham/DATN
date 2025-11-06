import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToOne,
  Unique,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { User } from '@modules/identity/users/entities/user.entity';
import { Department } from '@modules/core-data/departments/entities/department.entity';
import { ExamSupervisor } from '@modules/result/exam-supervisor/entities/exam-supervisor.entity';
@Entity()
export class Lecturer {
  @PrimaryKey()
  id!: number;

  @Property()
  @Unique()
  lecturerCode!: string;

  @Property()
  firstName!: string;

  @Property()
  lastName!: string;

  @Property()
  dateOfBirth!: Date;

  @Property()
  gender!: string; // "male" | "female" | "other"

  @Property()
  address?: string;

  @Property()
  phoneNumber?: string;

  @OneToOne(() => User, {
    owner: true,
    nullable: true,
    fieldName: 'user_id',
    type: 'number',
  })
  user?: User;

  @ManyToOne(() => Department, { nullable: true })
  department!: Department;

  @OneToMany(() => ExamSupervisor, (examSup) => examSup.lecturer)
  examSupervisor = new Collection<ExamSupervisor>(this);

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}
