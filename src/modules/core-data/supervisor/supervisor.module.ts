// supervisor.module.ts
import { Module } from '@nestjs/common';
import { SupervisorController } from './supervisor.controller';
import { SupervisorService } from './supervisor.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Supervisor } from './entities/supervisor.entity';
import { Lecturer } from '../lecturer/entities/lecturer.entity';
import { User } from '@modules/users/entities/user.entity';
import { Department } from '../departments/entities/department.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([Supervisor, Lecturer, User, Department]),
  ],
  controllers: [SupervisorController],
  providers: [SupervisorService],
  exports: [SupervisorService],
})
export class SupervisorModule {}
