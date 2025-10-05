import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { StudentCourseRegistration } from './entities/student-course-registration.entity';
import { StudentCourseRegistrationsService } from './student-course-registrations.service';
import { StudentCourseRegistrationsController } from './student-course-registrations.controller';

@Module({
  imports: [MikroOrmModule.forFeature([StudentCourseRegistration])],
  controllers: [StudentCourseRegistrationsController],
  providers: [StudentCourseRegistrationsService],
})
export class StudentCourseRegistrationsModule {}
