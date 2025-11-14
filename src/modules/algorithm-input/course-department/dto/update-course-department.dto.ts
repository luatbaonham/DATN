import { PartialType } from '@nestjs/swagger';
import { CreateCourseDepartmentDto } from './create-course-department.dto';

export class UpdateCourseDepartmentDto extends PartialType(
  CreateCourseDepartmentDto,
) {}
