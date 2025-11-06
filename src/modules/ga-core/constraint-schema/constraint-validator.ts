import Ajv, { ErrorObject } from 'ajv';
import { ConstraintSchemas } from './constraint-schemas';

const ajv = new Ajv({ allErrors: true });

export class ConstraintValidator {
  static validateRule(constraintCode: string, rule: any) {
    const schema = ConstraintSchemas[constraintCode];

    // Nếu chưa có schema — cho qua, chỉ cảnh báo
    if (!schema) {
      return {
        valid: true,
        normalized: rule,
        warnings: [`⚠️ Chưa có schema cho constraint ${constraintCode}`],
      };
    }

    const validate = ajv.compile(schema);
    const valid = validate(rule);

    if (!valid) {
      return {
        valid: false,
        errors: this.formatErrors(validate.errors),
      };
    }

    const normalized = this.normalize(constraintCode, rule);
    return { valid: true, normalized };
  }

  /**
   * Convert lỗi từ AJV thành định dạng chuẩn (field + message)
   */
  private static formatErrors(errors?: ErrorObject[] | null) {
    if (!errors) return [];
    return errors.map((e) => ({
      field: e.instancePath || '(root)',
      message: e.message || 'Invalid value',
    }));
  }

  /**
   * Chuẩn hóa dữ liệu rule cho thuật toán đọc dễ hơn
   */
  private static normalize(
    constraintCode: string,
    rule: any,
  ): Record<string, any> {
    switch (constraintCode) {
      case 'HOLIDAY':
        return { holidays: rule.holiday };
      case 'MAX_EXAMS_PER_DAY':
        return { maxExamsPerStudentPerDay: rule.max };
      case 'AVOID_WEEKEND':
        return { avoidWeekend: rule.active };
      case 'ROOM_CAPACITY':
        return { enforceRoomCapacity: rule.enforce };
      case 'GAP_BETWEEN_EXAMS':
        return { minGapBetweenExamsMinutes: rule.minGapMinutes };
      case 'LECTURER_MAX_SUPERVISIONS':
        return { maxLecturerSupervisionsPerDay: rule.max };
      case 'FIXED_TIME_CONSTRAINT':
        return { fixedExams: rule.fixedExams };
      default:
        return rule;
    }
  }
}
