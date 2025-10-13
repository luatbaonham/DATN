import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { ConstraintRule } from '../entities/constraint-rule.entity';
import { CreateConstraintRuleDto } from '../dto/create-constraint-rule.dto';
import { UpdateConstraintRuleDto } from '../dto/update-constraint-rule.dto';
import { Constraint } from '../entities/constraint.entity';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';

@Injectable()
export class ConstraintRuleService {
  constructor(private readonly em: EntityManager) {}

  async findAll(): Promise<ConstraintRule[]> {
    return this.em.find(
      ConstraintRule,
      {},
      { populate: ['constraint', 'examSession'] },
    );
  }

  async findOne(id: number): Promise<ConstraintRule> {
    const rule = await this.em.findOne(
      ConstraintRule,
      { id },
      { populate: ['constraint', 'examSession'] },
    );
    if (!rule) throw new NotFoundException('ConstraintRule không tồn tại');
    return rule;
  }

  async create(dto: CreateConstraintRuleDto): Promise<ConstraintRule> {
    const { constraintId, examSessionId, ...rest } = dto;

    // kiểm tra constraint bắt buộc
    const constraint = await this.em.findOne(Constraint, { id: constraintId });
    if (!constraint) throw new NotFoundException('Constraint không tồn tại');

    // examBatchId có thể null
    let examSession: ExamSession | null = null;
    if (examSessionId) {
      examSession = await this.em.findOne(ExamSession, { id: examSessionId });
      if (!examSession) throw new NotFoundException('Đợt thi không tồn tại');
    }

    const rule = this.em.create(ConstraintRule, {
      ...rest,
      constraint,
      examSession,
    });

    await this.em.persistAndFlush(rule);
    return rule;
  }

  async update(
    id: number,
    dto: UpdateConstraintRuleDto,
  ): Promise<ConstraintRule> {
    const rule = await this.findOne(id);

    const { constraintId, examSessionId, ...rest } = dto;

    // cập nhật constraint nếu có
    if (constraintId) {
      const constraint = await this.em.findOne(Constraint, {
        id: constraintId,
      });
      if (!constraint) throw new NotFoundException('Constraint không tồn tại');
      rule.constraint = constraint;
    }

    if (examSessionId !== undefined) {
      if (examSessionId === null) {
        rule.examSession = null;
      } else {
        const examSession = await this.em.findOne(ExamSession, {
          id: examSessionId,
        });
        if (!examSession) throw new NotFoundException('Đợt thi không tồn tại');
        rule.examSession = examSession;
      }
    }

    this.em.assign(rule, rest);
    await this.em.persistAndFlush(rule);
    return rule;
  }

  async remove(id: number) {
    const rule = await this.findOne(id);
    await this.em.removeAndFlush(rule);
    return { message: 'Đã xóa ConstraintRule thành công' };
  }
}
