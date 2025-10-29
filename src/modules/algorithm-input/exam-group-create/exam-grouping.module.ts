import { Module } from '@nestjs/common';
import { ExamGroupingController } from './exam-grouping.controller';
import { ExamGroupingService } from './exam-grouping.service';

@Module({
  imports: [],
  controllers: [ExamGroupingController],
  providers: [ExamGroupingService],
  exports: [ExamGroupingService], // Export nếu bạn muốn dùng service này ở nơi khác
})
export class ExamGroupingModule {}
