import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { ConstraintRule } from './constraint-rule.entity';

@Entity()
export class Constraint {
  @PrimaryKey()
  id!: number;

  @Property()
  constraintCode!: string;

  @Property()
  description!: string;

  @Property()
  type!: string;

  @Property()
  scope!: string;

  @OneToMany(() => ConstraintRule, (rule) => rule.constraint)
  rules = new Collection<ConstraintRule>(this);
}
