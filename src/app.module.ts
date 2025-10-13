import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import config from 'mikro-orm.config';
import { UsersModule } from '@modules/identity/users/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@modules/identity/auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RolesPermissionsModule } from '@modules/identity/roles-permissions/roles-per.module';
import { DepartmentModule } from '@modules/core-data/departments/department.module';
import { StudentModule } from '@modules/core-data/students/student.module';
import { ClassModule } from '@modules/core-data/classes/class.module';
import { LecturerModule } from '@modules/core-data/lecturer/lecturer.module';
import { CourseModule } from '@modules/algorithm-input/course/course.module';
import { ExamSessionModule } from '@modules/algorithm-input/exam-session/exam-session.module';
import { RoomsModule } from '@modules/algorithm-input/room/room.module';
import { StudentCourseRegistrationsModule } from '@modules/algorithm-input/student-course-registration/student-course-registrations.module';
import { StudentExamGroupsModule } from '@modules/algorithm-input/student-exam-group/student-exam-groups.module';
import { ExamGroupsModule } from '@modules/algorithm-input/exam-group/exam-groups.module';
import { LocationsModule } from '@modules/algorithm-input/location/locations.module';
import { SchedulingModule } from '@modules/algorithm-input/scheduling/scheduling.module';
import { ConstraintModule } from '@modules/constraints/constraint.module';
@Module({
  imports: [
    MikroOrmModule.forRoot(config),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    //
    AuthModule,
    RolesPermissionsModule,
    UsersModule,
    //
    ClassModule,
    DepartmentModule,
    LecturerModule,
    StudentModule,
    //
    CourseModule,
    ExamGroupsModule,
    ExamSessionModule,
    LocationsModule,
    RoomsModule,
    StudentCourseRegistrationsModule,
    StudentExamGroupsModule,
    //
    SchedulingModule,
    ConstraintModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
