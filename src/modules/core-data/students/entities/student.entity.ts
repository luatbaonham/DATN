import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { StudentCourseRegistration } from '@modules/algorithm-input/student-course-registration/entities/student-course-registration.entity';
import { StudentExamGroup } from '@modules/algorithm-input/student-exam-group/entities/student-exam-group.entity';
import { Classes } from '@modules/core-data/classes/entities/class.entity';
import { User } from '@modules/identity/users/entities/user.entity';

@Entity()
export class Student {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  studentCode!: string;

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

  @ManyToOne(() => Classes)
  classes!: Classes;

  @OneToMany(() => StudentCourseRegistration, (reg) => reg.student)
  registrations = new Collection<StudentCourseRegistration>(this);

  @OneToMany(() => StudentExamGroup, (seg) => seg.student)
  examGroups = new Collection<StudentExamGroup>(this);

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
