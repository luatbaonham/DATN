import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { UserRole } from '../../users/entities/user-role.entity';
import { RolePermission } from './role-permission.entity';

@Entity()
export class Role {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  description?: string;

  // inverse side
  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles = new Collection<UserRole>(this);

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions = new Collection<RolePermission>(this);

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
