import { Module } from '@nestjs/common';
import { ExamGroupingController } from './exam-grouping.controller';
import { ExamGroupingService } from './exam-grouping.service';

@Module({
  controllers: [ExamGroupingController],
  providers: [ExamGroupingService],
  exports: [ExamGroupingService],
})
export class ExamGroupingModule {}
