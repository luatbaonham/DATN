import { Module } from '@nestjs/common';
import { SchedulingRunnerService } from './scheduling-runner.service';
import { SchedulingRunnerController } from './scheduling-runner.controller';
import { GenerateInputModule } from '../generate-input/generate-input.module';

@Module({
  controllers: [SchedulingRunnerController],
  providers: [SchedulingRunnerService],
  imports: [GenerateInputModule],
})
export class SchedulingRunnerModule {}
