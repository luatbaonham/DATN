import {
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Classes } from '@modules/core-data/classes/entities/class.entity';
import { User } from '@modules/users/entities/user.entity';

@Entity()
export class Student {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  studentCode!: string;

  @Property()
  dateOfBirth!: Date;

  @Property()
  gender!: string; // "male" | "female" | "other"

  @Property()
  address?: string;

  @Property()
  phoneNumber?: string;

  @OneToOne(() => User, { owner: true, nullable: true })
  user?: User;

  @ManyToOne(() => Classes, { nullable: true })
  class?: Classes;

  @Property({ onCreate: () => new Date() })
  createAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updateAt?: Date;
}
