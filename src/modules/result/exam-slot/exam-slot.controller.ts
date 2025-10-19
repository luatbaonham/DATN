import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExamSlotService } from './exam-slot.service';
import { CreateExamSlotDto } from './dto/create-exam-slot.dto';
import { UpdateExamSlotDto } from './dto/update-exam-slot.dto';
import { ExamSlotResponseDto } from './dto/exam-slot-response.dto';
import { ExamSlotFilterDto } from './dto/exam-slot-filter.dto';
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
@ApiTags('exam-slots')
@Controller('exam-slots')
export class ExamSlotController {
  constructor(private readonly examSlotService: ExamSlotService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách ca thi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'slotName', required: false, type: String })
  async findAll(
    @Query() filter: ExamSlotFilterDto,
  ): Promise<PaginatedResponseDto<ExamSlotResponseDto>> {
    return this.examSlotService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết ca thi' })
  @ApiResponse({ status: 200, type: ExamSlotResponseDto })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ExamSlotResponseDto> {
    const slot = await this.examSlotService.findOne(id);
    return plainToInstance(ExamSlotResponseDto, slot, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Tạo ca thi mới' })
  @ApiResponse({ status: 200, type: ExamSlotResponseDto })
  async create(@Body() dto: CreateExamSlotDto): Promise<ExamSlotResponseDto> {
    const slot = await this.examSlotService.create(dto);
    return plainToInstance(ExamSlotResponseDto, slot, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật ca thi' })
  @ApiBody({ type: UpdateExamSlotDto })
  @ApiResponse({ status: 200, type: ExamSlotResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamSlotDto,
  ): Promise<ExamSlotResponseDto> {
    const slot = await this.examSlotService.update(id, dto);
    return plainToInstance(ExamSlotResponseDto, slot, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá ca thi' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    const result = await this.examSlotService.remove(id);
    return { success: result };
  }
}
