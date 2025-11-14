import { Student } from './../../students/entities/student.entity';
import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { AcademicYear } from '@modules/core-data/academic-year/entities/academic-year.entity';
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

  @ManyToOne(() => AcademicYear)
  nam_nhap_hoc!: AcademicYear;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
