import { Entity, PrimaryKey, ManyToOne } from '@mikro-orm/core';
import { User } from './user.entity';
import { Role } from '../../roles-permissions/entities/role.entity';

@Entity()
export class UserRole {
  @ManyToOne(() => User, { primary: true })
  user!: User;

  @ManyToOne(() => Role, { primary: true })
  role!: Role;
}
