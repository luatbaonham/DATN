import { PartialType } from '@nestjs/swagger';
import { CreateExamSupervisorDto } from './create-exam-supervisor.dto';

export class UpdateExamSupervisorDto extends PartialType(
  CreateExamSupervisorDto,
) {}
