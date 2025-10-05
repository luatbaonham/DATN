import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ExamSession } from './entities/exam-session.entity';
import { ExamSessionController } from './exam-session.controller';
import { ExamSessionService } from './exam-session.service';

@Module({
  imports: [MikroOrmModule.forFeature([ExamSession])],
  controllers: [ExamSessionController],
  providers: [ExamSessionService],
  exports: [],
})
export class ExamSessionModule {}
