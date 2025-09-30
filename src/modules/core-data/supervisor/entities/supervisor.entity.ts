import {
  Entity,
  PrimaryKey,
  Property,
  OneToOne,
  Unique,
} from '@mikro-orm/core';
import { Lecturer } from '@modules/core-data/lecturer/entities/lecturer.entity';

@Entity()
export class Supervisor {
  @PrimaryKey()
  id!: number;

  @Property()
  @Unique()
  code!: string;

  @OneToOne(() => Lecturer, (lecturer) => lecturer.supervisor, { owner: true })
  lecturer!: Lecturer;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}
