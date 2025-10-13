import { PartialType } from '@nestjs/swagger';
import { CreateConstraintRuleDto } from './create-constraint-rule.dto';

export class UpdateConstraintRuleDto extends PartialType(
  CreateConstraintRuleDto,
) {}
