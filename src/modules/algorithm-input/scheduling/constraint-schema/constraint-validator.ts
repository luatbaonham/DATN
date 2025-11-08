import Ajv, { ErrorObject } from 'ajv';
import { ConstraintSchemas } from './constraint-schemas';

const ajv = new Ajv({ allErrors: true });

export class ConstraintValidator {
  static validateRule(constraintCode: string, rule: any) {
    const schema =
      ConstraintSchemas[constraintCode as keyof typeof ConstraintSchemas];

    if (!schema) {
      return {
        valid: false,
        errors: [
          {
            field: 'constraintCode',
            message: `Constraint ${constraintCode} không tồn tại trong schema`,
          },
        ],
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

  private static formatErrors(errors?: ErrorObject[] | null) {
    if (!errors) return [];
    return errors.map((e) => ({
      field: e.instancePath || '(root)',
      message: e.message || 'Invalid value',
    }));
  }

  private static normalize(
    constraintCode: string,
    rule: any,
  ): Record<string, any> {
    switch (constraintCode) {
      case 'HOLIDAY':
        return { holidays: rule.holiday };
      case 'MAX_EXAMS_PER_DAY':
        return { maxExamsPerStudentPerDay: rule.max_exam_per_day };
      case 'AVOID_WEEKEND':
        return { avoidWeekend: rule.avoid_weekend };
      case 'ROOM_LOCATION_LIMIT':
        return { maxLocationPerRoom: rule.max_location };
      default:
        return rule;
    }
  }
}
