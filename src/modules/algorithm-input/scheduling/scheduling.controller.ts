import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SchedulingServiceV2 } from './schedulingV2.service';
import { AdvancedScheduleDto } from './dto/advanced-schedule.dto'; // Thay đổi DTO
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('scheduling')
@Controller('scheduling')
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingServiceV2) {}

  @Post('generate-advanced') // Tạo endpoint mới
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: AdvancedScheduleDto }) // Sử dụng DTO mới
  @ApiResponse({ status: 200, description: 'Lịch thi đã được tạo thành công.' })
  async generateAdvancedSchedule(@Body() scheduleDto: AdvancedScheduleDto) {
    return this.schedulingService.generateAdvanced(scheduleDto);
  }
}
