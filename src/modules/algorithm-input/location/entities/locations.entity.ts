// location.entity.ts
import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { User } from '@modules/identity/users/entities/user.entity';
import { Department } from '@modules/core-data/departments/entities/department.entity';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';
import { Room } from '@modules/algorithm-input/room/entities/room.entity';

@Entity({ tableName: 'locations' })
export class Locations {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  code!: string; // mã_cơ_sở

  @Property()
  name!: string; // tên_cơ_sở

  @Property()
  address!: string;

  @OneToMany(() => User, (user) => user.location)
  users = new Collection<User>(this);

  @OneToMany(() => Department, (dep) => dep.location)
  departments = new Collection<Department>(this);

  @OneToMany(() => ExamSession, (session) => session.location)
  examSessions = new Collection<ExamSession>(this);

  @OneToMany(() => Room, (room) => room.location)
  rooms = new Collection<Room>(this);

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
