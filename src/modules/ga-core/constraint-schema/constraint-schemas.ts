import { JSONSchemaType } from 'ajv';
import {
  HolidayRule,
  AvoidWeekendRule,
  MaxExamsPerDayRule,
  RoomLocationLimitRule,
} from './constraint.types';

/**
 * Danh sách các schema JSON tương ứng cho từng constraint code
 * Mỗi schema mô tả cấu trúc JSON hợp lệ cho cột "rule"
 */

export const ConstraintSchemas = {
  HOLIDAY: {
    type: 'object',
    properties: {
      holiday: {
        type: 'array',
        items: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
      },
    },
    required: ['holiday'],
    additionalProperties: false,
  } as JSONSchemaType<HolidayRule>,

  AVOID_WEEKEND: {
    type: 'object',
    properties: {
      avoid_weekend: { type: 'boolean' },
    },
    required: ['avoid_weekend'],
    additionalProperties: false,
  } as JSONSchemaType<AvoidWeekendRule>,

  MAX_EXAMS_PER_DAY: {
    type: 'object',
    properties: {
      max_exam_per_day: { type: 'number', minimum: 1 },
    },
    required: ['max_exam_per_day'],
    additionalProperties: false,
  } as JSONSchemaType<MaxExamsPerDayRule>,

  ROOM_LOCATION_LIMIT: {
    type: 'object',
    properties: {
      max_location: { type: 'number', minimum: 1 },
    },
    required: ['max_location'],
    additionalProperties: false,
  } as JSONSchemaType<RoomLocationLimitRule>,
};
