import { PartialType } from '@nestjs/swagger';
import { CreateStudentCourseRegistrationDto } from './create-student-course-registration.dto';

export class UpdateStudentCourseRegistrationDto extends PartialType(
  CreateStudentCourseRegistrationDto,
) {}
