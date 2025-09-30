import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import config from 'mikro-orm.config';
import { UsersModule } from '@modules/users/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@modules/auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RolesPermissionsModule } from '@modules/roles-permissions/roles-per.module';
import { DepartmentModule } from '@modules/core-data/departments/department.module';
import { StudentModule } from '@modules/core-data/students/student.module';
import { ClassModule } from '@modules/core-data/classes/class.module';
import { SupervisorModule } from '@modules/core-data/supervisor/supervisor.module';
import { LecturerModule } from '@modules/core-data/lecturer/lecturer.module';
@Module({
  imports: [
    MikroOrmModule.forRoot(config),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    RolesPermissionsModule,
    DepartmentModule,
    StudentModule,
    ClassModule,
    SupervisorModule,
    LecturerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
