import { Controller, Get, Param } from '@nestjs/common';
import { ScheduleConfigService } from './scheduling-config.service';

@Controller('api/schedule/config')
export class ScheduleConfigController {
  constructor(private readonly service: ScheduleConfigService) {}

  @Get(':examSessionId')
  async getConfig(@Param('examSessionId') examSessionId: number) {
    return this.service.getConfig(Number(examSessionId));
  }
}
