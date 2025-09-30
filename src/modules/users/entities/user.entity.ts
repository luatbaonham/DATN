import {
  Collection,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { UserRole } from './user-role.entity';
import { RefreshToken } from '@modules/auth/entities/refresh_token.entity';
import { Student } from '@modules/core-data/students/entities/student.entity';
import { Lecturer } from '@modules/core-data/lecturer/entities/lecturer.entity';

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property()
  firstName!: string;

  @Property()
  lastName!: string;

  @Property()
  email!: string;

  @Property()
  password!: string;

  @OneToOne(() => Student, (student) => student.user)
  student?: Student;

  @OneToOne(() => Lecturer, (lecturer) => lecturer.user)
  lecturer?: Lecturer;

  // owning side of pivot
  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles = new Collection<UserRole>(this);

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens = new Collection<RefreshToken>(this);

  @Property({ onCreate: () => new Date() })
  createAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updateAt?: Date;
}
