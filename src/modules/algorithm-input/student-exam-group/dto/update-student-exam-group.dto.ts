import { PartialType } from '@nestjs/swagger';
import { CreateStudentExamGroupDto } from './create-student-exam-group.dto';

export class UpdateStudentExamGroupDto extends PartialType(
  CreateStudentExamGroupDto,
) {}
