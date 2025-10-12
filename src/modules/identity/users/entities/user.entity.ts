import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { UserRole } from './user-role.entity';
import { RefreshToken } from '@modules/identity/auth/entities/refresh_token.entity';
import { Student } from '@modules/core-data/students/entities/student.entity';
import { Lecturer } from '@modules/core-data/lecturer/entities/lecturer.entity';
import { Locations } from '@modules/algorithm-input/location/entities/locations.entity';

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  // @Property()
  // firstName!: string;

  // @Property()
  // lastName!: string;

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

  @ManyToOne(() => Locations, { nullable: true })
  location?: Locations;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
