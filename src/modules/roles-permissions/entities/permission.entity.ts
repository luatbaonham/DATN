import {
  Entity,
  PrimaryKey,
  Property,
  Enum,
  Collection,
  OneToMany,
} from '@mikro-orm/core';
import { RolePermission } from './role-permission.entity';

@Entity()
export class Permission {
  @PrimaryKey()
  id!: number;

  @Property({ index: true })
  action!: string;

  @Property({ index: true })
  resource!: string;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions = new Collection<RolePermission>(this);

  @Property({ nullable: true })
  description?: string;

  @Property({ onCreate: () => new Date() })
  createAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updateAt?: Date;
  // dùng cho PBAC (Policy Based Access Control)
  @Property({ type: 'json', nullable: true })
  conditions?: { [key: string]: any };
}
