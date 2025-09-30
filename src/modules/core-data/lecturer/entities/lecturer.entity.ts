import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToOne,
  Unique,
} from '@mikro-orm/core';
import { User } from '@modules/users/entities/user.entity';
import { Department } from '@modules/core-data/departments/entities/department.entity';
import { Supervisor } from '@modules/core-data/supervisor/entities/supervisor.entity';
@Entity()
export class Lecturer {
  @PrimaryKey()
  id!: number;

  @Property()
  @Unique()
  lecturerCode!: string;

  @OneToOne(() => User, { owner: true })
  user!: User;

  @ManyToOne(() => Department)
  department!: Department;

  @OneToOne(() => Supervisor, (supervisor) => supervisor.lecturer)
  supervisor?: Supervisor;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}
