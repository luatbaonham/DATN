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
  @Permissions('manage_exams:read')
  @ApiOperation({ summary: 'Lấy danh sách kỳ thi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query() filter: ExamFilterDto,
  ): Promise<PaginatedResponseDto<ExamResponseDto>> {
    return this.examService.findAll(filter);
  }

  @Get(':id')
  @Permissions('manage_exams:read')
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
  @Permissions('manage_exams:create')
  @ApiOperation({ summary: 'Tạo kỳ thi mới' })
  @ApiResponse({ status: 200, type: ExamResponseDto })
  async create(@Body() dto: CreateExamDto): Promise<ExamResponseDto> {
    const exam = await this.examService.create(dto);
    return plainToInstance(ExamResponseDto, exam, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @Permissions('manage_exams:update')
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
  @Permissions('manage_exams:delete')
  @ApiOperation({ summary: 'Xoá kỳ thi' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    const result = await this.examService.remove(id);
    return { success: result };
  }
}
