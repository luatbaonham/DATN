import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ExamGroup } from './entities/exam-group.entity';
import { ExamGroupsService } from './exam-groups.service';
import { ExamGroupsController } from './exam-groups.controller';

@Module({
  imports: [MikroOrmModule.forFeature([ExamGroup])],
  controllers: [ExamGroupsController],
  providers: [ExamGroupsService],
})
export class ExamGroupsModule {}
