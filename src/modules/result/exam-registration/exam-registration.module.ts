import { Module } from '@nestjs/common';
import { ExamRegistrationController } from './exam-registration.controller';
import { ExamRegistrationService } from './exam-registration.service';

@Module({
  controllers: [ExamRegistrationController],
  providers: [ExamRegistrationService],
  exports: [],
})
export class ExamRegistrationModule {}
