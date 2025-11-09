import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

// Import các file vừa tạo
import { SchedulingService } from './scheduling.service';
import { GeneticAlgorithmService } from './genetic-algorithm.service'; // <-- MỚI
import { SchedulingController } from './scheduling.controller';

// Import tất cả các Entity bạn dùng
import { Room } from '@modules/algorithm-input/room/entities/room.entity';
import { Lecturer } from '@modules/core-data/lecturer/entities/lecturer.entity';
import { ExamGroup } from '@modules/algorithm-input/exam-group/entities/exam-group.entity';
import { StudentExamGroup } from '@modules/algorithm-input/student-exam-group/entities/student-exam-group.entity';
import { Exam } from '@modules/result/exam/entities/exam.entity';
import { ExamRegistration } from '@modules/result/exam-registration/entities/exam-registration.entity';
import { ExamSupervisor } from '@modules/result/exam-supervisor/entities/exam-supervisor.entity';
import { Student } from '@modules/core-data/students/entities/student.entity';
import { ExamSlot } from '@modules/result/exam-slot/entities/exam-slot.entity';
import { ExamGroupingService } from './exam-grouping.service';
import { ScheduleConfigService } from './scheduling-config.service';
import { ScheduleConfigController } from './scheduling-config.controller';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Room,
      Lecturer,
      ExamGroup,
      StudentExamGroup,
      Exam,
      ExamRegistration,
      ExamSupervisor,
      Student,
      ExamSlot, // <-- Đảm bảo ExamSlot cũng được import
    ]),
  ],
  controllers: [SchedulingController, ScheduleConfigController],
  providers: [
    SchedulingService,
    GeneticAlgorithmService, // <-- Thêm service mới vào providers
    ExamGroupingService,
    ScheduleConfigService,
  ],
})
export class SchedulingModule {}
