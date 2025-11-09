import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { ScheduleConfig } from './entities/scheduling-config.entity';
import { ConstraintRule } from '@modules/constraints/entities/constraint-rule.entity';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';
import { ConstraintsRuleDto } from './dto/schedule-request.dto';
import { Constraint } from '@modules/constraints/entities/constraint.entity';
import { Room } from '@modules/algorithm-input/room/entities/room.entity';

@Injectable()
export class ScheduleConfigService {
  constructor(private readonly em: EntityManager) {}

  /** 🟢 Lưu cấu hình khi xếp lần đầu */
  async saveConfig(examSessionId: number, payload: any) {
    const examSession = await this.em.findOne(ExamSession, examSessionId);
    if (!examSession) throw new NotFoundException('ExamSession không tồn tại');

    const { startDate, endDate, rooms, lecturers, constraints } = payload;

    // 1. Xóa config cũ (nếu có)
    await this.em.nativeDelete(ScheduleConfig, { examSession: examSessionId });
    await this.em.nativeDelete(ConstraintRule, { examSession: examSessionId });

    // 2. Lưu ScheduleConfig
    const config = this.em.create(ScheduleConfig, {
      examSession,
      startDate,
      endDate,
      rooms,
      lecturers,
    });
    await this.em.persistAndFlush(config);

    // 3. Lưu ConstraintRule (mapping từ constraintCode → constraint entity)
    if (constraints && constraints.length > 0) {
      const allConstraints = await this.em.find(Constraint, {});
      const constraintMap = new Map(
        allConstraints.map((c) => [c.constraintCode, c]),
      );

      for (const dto of constraints as ConstraintsRuleDto[]) {
        const constraint = constraintMap.get(dto.constraintCode);
        if (!constraint)
          throw new BadRequestException(
            `Constraint ${dto.constraintCode} không tồn tại`,
          );

        const rule = this.em.create(ConstraintRule, {
          examSession,
          constraint,
          isActive: true,
          rule: dto.rule,
        });
        this.em.persist(rule);
      }
      await this.em.flush();
    }

    return { message: 'Đã lưu cấu hình xếp lịch cho đợt thi' };
  }

  /** 🟡 Lấy lại cấu hình đã xếp */
  async getConfig(examSessionId: number) {
    const config = await this.em.findOne(ScheduleConfig, {
      examSession: examSessionId,
    });
    if (!config)
      return {
        examSessionId,
        message: 'Chưa có cấu hình lịch thi cho đợt này',
      };

    const constraintRules = await this.em.find(
      ConstraintRule,
      { examSession: examSessionId, isActive: true },
      { populate: ['constraint'] },
    );

    const roomIds = config.rooms.map((room: any) => room.id);
    const roomsWithDetails = await this.em.find(
      Room,
      { id: { $in: roomIds } },
      { populate: ['location'] },
    );

    // Map rooms với thông tin chi tiết
    const enrichedRooms = config.rooms.map((roomConfig: any) => {
      const roomDetail = roomsWithDetails.find((r) => r.id === roomConfig.id);
      return {
        ...roomConfig,
        code: roomDetail?.code || null,
        location: roomDetail?.location
          ? {
              id: roomDetail.location.id,
              code: roomDetail.location.code,
              name: roomDetail.location.name,
            }
          : null,
      };
    });

    return {
      examSessionId,
      startDate: config.startDate,
      endDate: config.endDate,
      rooms: enrichedRooms,
      lecturers: config.lecturers,
      constraints: constraintRules.map((cr) => ({
        constraintCode: cr.constraint.constraintCode,
        rule: cr.rule,
      })),
    };
  }
}
