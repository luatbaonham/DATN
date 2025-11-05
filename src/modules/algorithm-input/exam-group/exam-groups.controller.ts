import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ExamGroupsService } from './exam-groups.service';
import { CreateExamGroupDto } from './dto/create-exam-group.dto';
import { UpdateExamGroupDto } from './dto/update-exam-group.dto';
import { ExamGroupResponseDto } from './dto/exam-group-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ExamGroupFilterDto } from './dto/exam-group-filter.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';

@ApiTags('exam group')
@Controller('exam-groups')
export class ExamGroupsController {
  constructor(private readonly service: ExamGroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo nhóm thi mới' })
  @ApiResponse({ status: 201, type: ExamGroupResponseDto })
  async create(@Body() dto: CreateExamGroupDto): Promise<ExamGroupResponseDto> {
    const group = await this.service.create(dto);
    return plainToInstance(ExamGroupResponseDto, group, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách nhóm thi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query() filter: ExamGroupFilterDto,
  ): Promise<PaginatedResponseDto<ExamGroupResponseDto>> {
    return this.service.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết nhóm thi' })
  @ApiResponse({ status: 200, type: ExamGroupResponseDto })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ExamGroupResponseDto> {
    const group = await this.service.findOne(id);
    return plainToInstance(ExamGroupResponseDto, group, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật nhóm thi' })
  @ApiResponse({ status: 200, type: ExamGroupResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamGroupDto,
  ): Promise<ExamGroupResponseDto> {
    const group = await this.service.update(id, dto);
    return plainToInstance(ExamGroupResponseDto, group, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa nhóm thi' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return { success: await this.service.remove(id) };
  }

  @Delete()
  @ApiOperation({
    summary: 'Xóa tất cả exam groups nếu chưa có exam',
    description:
      'Xóa tất cả exam groups (và student_exam_groups) nếu chưa có lịch thi nào được tạo. Có thể filter theo exam_session_id.',
  })
  @ApiQuery({
    name: 'exam_session_id',
    required: false,
    type: Number,
    description:
      'ID của đợt thi (nếu muốn xóa exam groups của 1 đợt thi cụ thể)',
  })
  @ApiResponse({
    status: 200,
    description: 'Kết quả xóa',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        deleted: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  async removeAllIfNoExams(
    @Query('exam_session_id', new ParseIntPipe({ optional: true }))
    examSessionId?: number,
  ) {
    return this.service.removeAllIfNoExams(examSessionId);
  }
}
