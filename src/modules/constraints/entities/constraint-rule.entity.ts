import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';
import { Constraint } from './constraint.entity';

@Entity()
export class ConstraintRule {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => ExamSession, { nullable: true })
  examSession?: ExamSession | null;

  @ManyToOne(() => Constraint)
  constraint!: Constraint;

  @Property({ type: 'boolean' })
  isActive!: boolean;

  @Property({ type: 'json' })
  rule!: Record<string, any>;
}
