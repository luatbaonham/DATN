import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SingleConstraintRuleInput {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  constraintId!: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive!: boolean;

  @ApiProperty({
    example: { holiday: ['2025-10-20', '2025-04-30'] },
    description: 'Nội dung tham số của ràng buộc (JSON)',
  })
  @IsObject()
  rule!: Record<string, any>;
}

export class BatchConstraintRuleDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  examSessionId!: number;

  @ApiProperty({ type: [SingleConstraintRuleInput] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleConstraintRuleInput)
  rules!: SingleConstraintRuleInput[];
}
