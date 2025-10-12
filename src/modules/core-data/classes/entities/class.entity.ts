import { Student } from './../../students/entities/student.entity';
import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Department } from '@modules/core-data/departments/entities/department.entity';

@Entity()
export class Classes {
  @PrimaryKey()
  id!: number;

  @Property()
  className!: string;

  @Property()
  classCode!: string;

  @OneToMany(() => Student, (student) => student.classes)
  student = new Collection<Student>(this);

  @ManyToOne(() => Department)
  department!: Department;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
