import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { ExamResponseDto } from './dto/exam-response.dto';
import { ExamFilterDto } from './dto/exam-filter.dto';
import { ExamTimetableFilterDto } from './dto/exam-timetable-filter.dto';
import { ExamTimetableResponseDto } from './dto/exam-timetable-response.dto';
import { ExamDetailDto } from './dto/exam-detail.dto';
import { plainToInstance } from 'class-transformer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@modules/identity/auth/guard/auth.guard';
import { PermissionGuard } from '@modules/identity/auth/guard/permission.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@ApiTags('exams')
@Controller('exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách kỳ thi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Ngày bắt đầu (YYYY-MM-DD)',
    example: '2025-11-06',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Ngày kết thúc (YYYY-MM-DD)',
    example: '2025-11-06',
  })
  @ApiQuery({
    name: 'examSessionId',
    required: false,
    type: Number,
    description: 'ID của đợt thi',
  })
  async findAll(
    @Query() filter: ExamFilterDto,
  ): Promise<PaginatedResponseDto<ExamResponseDto>> {
    // Xử lý startDate và endDate để đảm bảo định dạng đúng
    if (filter.startDate) {
      // Kiểm tra định dạng YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(filter.startDate)) {
        throw new Error('startDate phải có định dạng YYYY-MM-DD');
      }
    }

    if (filter.endDate) {
      // Kiểm tra định dạng YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(filter.endDate)) {
        throw new Error('endDate phải có định dạng YYYY-MM-DD');
      }
    }

    return this.examService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết kỳ thi' })
  @ApiResponse({ status: 200, type: ExamResponseDto })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ExamResponseDto> {
    const exam = await this.examService.findOne(id);
    return plainToInstance(ExamResponseDto, exam, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Tạo kỳ thi mới' })
  @ApiResponse({ status: 200, type: ExamResponseDto })
  async create(@Body() dto: CreateExamDto): Promise<ExamResponseDto> {
    const exam = await this.examService.create(dto);
    return plainToInstance(ExamResponseDto, exam, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật kỳ thi' })
  @ApiBody({ type: UpdateExamDto })
  @ApiResponse({ status: 200, type: ExamResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamDto,
  ): Promise<ExamResponseDto> {
    const exam = await this.examService.update(id, dto);
    return plainToInstance(ExamResponseDto, exam, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá kỳ thi' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    const result = await this.examService.remove(id);
    return { success: result };
  }

  @Get('timetable/view')
  @ApiOperation({
    summary: 'Lấy lịch thi theo khoảng thời gian (định dạng timetable)',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'examSessionId', required: false, type: Number })
  @ApiResponse({ status: 200, type: ExamTimetableResponseDto })
  async getExamTimetable(
    @Query() filter: ExamTimetableFilterDto,
  ): Promise<ExamTimetableResponseDto> {
    return this.examService.getExamTimetable(filter);
  }

  @Get(':id/detail')
  @ApiOperation({
    summary: 'Lấy chi tiết kỳ thi bao gồm danh sách sinh viên và giám thị',
  })
  @ApiResponse({ status: 200, type: ExamDetailDto })
  async getExamDetail(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ExamDetailDto> {
    return this.examService.getExamDetail(id);
  }
}
