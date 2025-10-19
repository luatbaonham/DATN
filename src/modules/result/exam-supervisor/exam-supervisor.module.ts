import { Module } from '@nestjs/common';
import { ExamSupervisorController } from './exam-supervisor.controller';
import { ExamSupervisorService } from './exam-supervisor.service';

@Module({
  controllers: [ExamSupervisorController],
  providers: [ExamSupervisorService],
  exports: [],
})
export class ExamSupervisorModule {}
