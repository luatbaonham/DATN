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
  // api json
  // @Post('generate-advanced') // Tạo endpoint mới
  // @HttpCode(HttpStatus.OK)
  // @ApiBody({ type: AdvancedScheduleDto }) // Sử dụng DTO mới
  // @ApiResponse({ status: 200, description: 'Lịch thi đã được tạo thành công.' })
  // async generateAdvancedSchedule(@Body() scheduleDto: AdvancedScheduleDto) {
  //   return this.schedulingService.generateAdvanced(scheduleDto);
  // }

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
