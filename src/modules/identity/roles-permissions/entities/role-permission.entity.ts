import { Entity, ManyToOne } from '@mikro-orm/core';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity()
export class RolePermission {
  @ManyToOne(() => Role, { primary: true })
  role!: Role;

  @ManyToOne(() => Permission, { primary: true })
  permission!: Permission;
}
