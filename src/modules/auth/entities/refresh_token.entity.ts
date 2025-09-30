import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from '@modules/users/entities/user.entity';

@Entity()
export class RefreshToken {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @Property()
  token!: string;

  @Property()
  expiresAt!: Date;

  @Property()
  deviceInfo!: string; // vd: 'web', 'ios', 'android'

  @Property({ nullable: true })
  ipAddress?: string;

  @Property({ nullable: true })
  userAgent?: string;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ nullable: true })
  lastUsedAt?: Date; // update khi refresh token được dùng

  @Property({ nullable: true })
  revokedAt?: Date;
}
