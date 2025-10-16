import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Exam } from './entities/exam.entity';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';

@Module({
  imports: [MikroOrmModule.forFeature([Exam])],
  controllers: [ExamController],
  providers: [ExamService],
  exports: [],
})
export class ExamModule {}
