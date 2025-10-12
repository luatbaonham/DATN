import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToOne,
  Unique,
} from '@mikro-orm/core';
import { User } from '@modules/identity/users/entities/user.entity';
import { Department } from '@modules/core-data/departments/entities/department.entity';
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

  @Property({ default: false })
  isSupervisor!: boolean;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}
