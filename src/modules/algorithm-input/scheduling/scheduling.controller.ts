import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ScheduleRequestDto } from './dto/schedule-request.dto';

@ApiTags('scheduling')
@Controller('scheduling')
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Post('generate-advanced')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: ScheduleRequestDto })
  @ApiResponse({ status: 200, description: 'Lịch thi đã được tạo thành công.' })
  async generateAdvancedSchedule(@Body() scheduleDto: ScheduleRequestDto) {
    return this.schedulingService.generateAdvanced(scheduleDto);
  }
  // API ĐỂ XÓA LỊCH THI THEO ĐỢT THI
  @Delete('session/:sessionId')
  async deleteSchedule(@Param('sessionId', ParseIntPipe) sessionId: number) {
    return this.schedulingService.deleteScheduleBySessionId(sessionId);
  }
}
