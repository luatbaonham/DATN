import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Constraint } from './entities/constraint.entity';
import { ConstraintRule } from './entities/constraint-rule.entity';
import { ConstraintService } from './service/constraint.service';
import { ConstraintRuleService } from './service/constraint-rule.service';
import { ConstraintController } from './controller/constraint.controller';
import { ConstraintRuleController } from './controller/constraint-rule.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Constraint, ConstraintRule])],
  controllers: [ConstraintController, ConstraintRuleController],
  providers: [ConstraintService, ConstraintRuleService],
  exports: [ConstraintService, ConstraintRuleService],
})
export class ConstraintModule {}
