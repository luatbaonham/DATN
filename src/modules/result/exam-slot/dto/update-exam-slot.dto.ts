import { PartialType } from '@nestjs/swagger';
import { CreateExamSlotDto } from './create-exam-slot.dto';

export class UpdateExamSlotDto extends PartialType(CreateExamSlotDto) {}
