import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ExamSupervisorService } from './exam-supervisor.service';
import { AuthGuard } from '@modules/identity/auth/guard/auth.guard';
import { PermissionGuard } from '@modules/identity/auth/guard/permission.guard';
import {
  UseGuards,
  Controller,
  Query,
  Get,
  Param,
  ParseIntPipe,
  Body,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import { ExamSupervisorFilterDto } from './dto/exam-supervisor-filter.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { ExamSupervisorResponseDto } from './dto/exam-supervisor-response.dto';
import { plainToInstance } from 'class-transformer';
import { CreateExamSupervisorDto } from './dto/create-exam-supervisor.dto';
import { UpdateExamSupervisorDto } from './dto/update-exam-supervisor.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@ApiTags('exam-supervisors')
@Controller('exam-supervisors')
export class ExamSupervisorController {
  constructor(private readonly examSupervisorService: ExamSupervisorService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách giám thị thi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query() filter: ExamSupervisorFilterDto,
  ): Promise<PaginatedResponseDto<ExamSupervisorResponseDto>> {
    return this.examSupervisorService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết giám thị thi' })
  @ApiResponse({ status: 200, type: ExamSupervisorResponseDto })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ExamSupervisorResponseDto> {
    const supervisor = await this.examSupervisorService.findOne(id);
    return plainToInstance(ExamSupervisorResponseDto, supervisor, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Thêm giám thị thi' })
  @ApiResponse({ status: 201, type: ExamSupervisorResponseDto })
  async create(
    @Body() dto: CreateExamSupervisorDto,
  ): Promise<ExamSupervisorResponseDto> {
    const supervisor = await this.examSupervisorService.create(dto);
    return plainToInstance(ExamSupervisorResponseDto, supervisor, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật giám thị thi' })
  @ApiResponse({ status: 200, type: ExamSupervisorResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamSupervisorDto,
  ): Promise<ExamSupervisorResponseDto> {
    const supervisor = await this.examSupervisorService.update(id, dto);
    return plainToInstance(ExamSupervisorResponseDto, supervisor, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá giám thị thi' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    const result = await this.examSupervisorService.remove(id);
    return { success: result };
  }
}
