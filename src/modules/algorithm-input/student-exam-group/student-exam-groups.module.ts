import { Module } from '@nestjs/common';
import { StudentExamGroupsService } from './student-exam-group.service';
import { StudentExamGroupsController } from './student-exam-groups.controller';

@Module({
  controllers: [StudentExamGroupsController],
  providers: [StudentExamGroupsService],
})
export class StudentExamGroupsModule {}
