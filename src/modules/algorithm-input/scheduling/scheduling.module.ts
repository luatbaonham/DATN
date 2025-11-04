import { Module } from '@nestjs/common';
import { SchedulingController } from './scheduling.controller';
import { SchedulingServiceV2 } from './schedulingV2.service';

@Module({
  controllers: [SchedulingController],
  providers: [SchedulingServiceV2],
})
export class SchedulingModule {}
