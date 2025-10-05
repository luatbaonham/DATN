import { PartialType } from '@nestjs/swagger';
import { CreateExamGroupDto } from './create-exam-group.dto';

export class UpdateExamGroupDto extends PartialType(CreateExamGroupDto) {}
