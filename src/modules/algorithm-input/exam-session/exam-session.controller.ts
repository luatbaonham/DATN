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
} from '@nestjs/common';
import { ExamSessionService } from './exam-session.service';
import { CreateExamSessionDto } from './dto/create-exam-session.dto';
import { UpdateExamSessionDto } from './dto/update-exam-session.dto';
import { ExamSessionResponseDto } from './dto/exam-session-response.dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '@modules/identity/auth/guard/auth.guard';
import { PermissionGuard } from '@modules/identity/auth/guard/permission.guard';

@ApiBearerAuth()
// @UseGuards(AuthGuard, PermissionGuard)
@ApiTags('exam-sessions')
@Controller('exam-sessions')
export class ExamSessionController {
  constructor(private readonly examSessionService: ExamSessionService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Danh sách tất cả đợt thi',
    type: [ExamSessionResponseDto],
  })
  async findAll(): Promise<ExamSessionResponseDto[]> {
    const sessions = await this.examSessionService.findAll();
    return plainToInstance(ExamSessionResponseDto, sessions, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Chi tiết đợt thi',
    type: ExamSessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đợt thi' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ExamSessionResponseDto> {
    const session = await this.examSessionService.findOne(id);
    return plainToInstance(ExamSessionResponseDto, session, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Tạo đợt thi thành công',
    type: ExamSessionResponseDto,
  })
  async create(
    @Body() dto: CreateExamSessionDto,
  ): Promise<ExamSessionResponseDto> {
    const session = await this.examSessionService.create(dto);
    return plainToInstance(ExamSessionResponseDto, session, {
      excludeExtraneousValues: true,
    });
  }

  @Post(':id/generate-exam-groups')
  @ApiResponse({
    status: 201,
    description: 'Tạo exam groups cho đợt thi thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        examGroupsCreated: { type: 'number' },
        studentExamGroupsCreated: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy đợt thi',
  })
  @ApiResponse({
    status: 400,
    description: 'Không có phòng thi hoặc đăng ký môn học',
  })
  async generateExamGroups(@Param('id', ParseIntPipe) id: number) {
    const result =
      await this.examSessionService.generateExamGroupsForSession(id);
    return {
      success: true,
      examGroupsCreated: result.examGroupsCreated,
      studentExamGroupsCreated: result.studentExamGroupsCreated,
      message: `Đã tạo thành công ${result.examGroupsCreated} exam groups và ${result.studentExamGroupsCreated} student exam groups`,
    };
  }

  @Put(':id')
  @ApiBody({ type: UpdateExamSessionDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật đợt thi thành công',
    type: ExamSessionResponseDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamSessionDto,
  ): Promise<ExamSessionResponseDto> {
    const session = await this.examSessionService.update(id, dto);
    return plainToInstance(ExamSessionResponseDto, session, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Xoá đợt thi thành công' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    const result = await this.examSessionService.remove(id);
    return { success: result };
  }
}
