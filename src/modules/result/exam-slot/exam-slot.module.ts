import { Module } from '@nestjs/common';
import { ExamSlotService } from './exam-slot.service';
import { ExamSlotController } from './exam-slot.controller';

@Module({
  controllers: [ExamSlotController],
  providers: [ExamSlotService],
  exports: [ExamSlotService],
})
export class ExamSlotModule {}
