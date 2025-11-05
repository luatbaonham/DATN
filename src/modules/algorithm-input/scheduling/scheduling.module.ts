import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from './scheduling.service';
import { Room } from '@modules/algorithm-input/room/entities/room.entity';
import { Lecturer } from '@modules/core-data/lecturer/entities/lecturer.entity';
import { ExamGroup } from '@modules/algorithm-input/exam-group/entities/exam-group.entity';
import { StudentExamGroup } from '@modules/algorithm-input/student-exam-group/entities/student-exam-group.entity';
import { Exam } from '@modules/result/exam/entities/exam.entity';
import { ExamRegistration } from '@modules/result/exam-registration/entities/exam-registration.entity';
import { ExamSupervisor } from '@modules/result/exam-supervisor/entities/exam-supervisor.entity';
import { Student } from '@modules/core-data/students/entities/student.entity';
@Module({
  imports: [
    MikroOrmModule.forFeature([
      Room,
      Lecturer,
      ExamGroup,
      StudentExamGroup,
      Exam, // <-- Thêm
      ExamRegistration, // <-- Thêm
      ExamSupervisor, // <-- Thêm
      Student, // <-- Thêm (nếu cần)
    ]),
  ],
  controllers: [SchedulingController],
  providers: [SchedulingService],
})
export class SchedulingModule {}
