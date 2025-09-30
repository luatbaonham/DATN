// lecturer.module.ts
import { Module } from '@nestjs/common';
import { LecturerController } from './lecturer.controller';
import { LecturerService } from './lecturer.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Lecturer } from './entities/lecturer.entity';
import { User } from '@modules/users/entities/user.entity';
import { Department } from '../departments/entities/department.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Lecturer, User, Department])],
  controllers: [LecturerController],
  providers: [LecturerService],
  exports: [LecturerService],
})
export class LecturerModule {}
