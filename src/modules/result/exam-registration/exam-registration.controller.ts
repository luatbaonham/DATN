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
import { ExamRegistrationService } from './exam-registration.service';
import { CreateExamRegistrationDto } from './dto/create-exam-registration.dto';
import { UpdateExamRegistrationDto } from './dto/update-exam-registration.dto';
import { ExamRegistrationFilterDto } from './dto/exam-registration-filter.dto';
import { ExamRegistrationResponseDto } from './dto/exam-registration-response.dto';
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
@ApiTags('exam-registrations')
@Controller('exam-registrations')
export class ExamRegistrationController {
  constructor(private readonly examRegService: ExamRegistrationService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách phiếu dự thi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query() filter: ExamRegistrationFilterDto,
  ): Promise<PaginatedResponseDto<ExamRegistrationResponseDto>> {
    return this.examRegService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết phiếu dự thi' })
  @ApiResponse({ status: 200, type: ExamRegistrationResponseDto })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ExamRegistrationResponseDto> {
    const reg = await this.examRegService.findOne(id);
    return plainToInstance(ExamRegistrationResponseDto, reg, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Tạo phiếu dự thi mới' })
  @ApiResponse({ status: 200, type: ExamRegistrationResponseDto })
  async create(
    @Body() dto: CreateExamRegistrationDto,
  ): Promise<ExamRegistrationResponseDto> {
    const reg = await this.examRegService.create(dto);
    return plainToInstance(ExamRegistrationResponseDto, reg, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật phiếu dự thi' })
  @ApiBody({ type: UpdateExamRegistrationDto })
  @ApiResponse({ status: 200, type: ExamRegistrationResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamRegistrationDto,
  ): Promise<ExamRegistrationResponseDto> {
    const reg = await this.examRegService.update(id, dto);
    return plainToInstance(ExamRegistrationResponseDto, reg, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá phiếu dự thi' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    const result = await this.examRegService.remove(id);
    return { success: result };
  }
}
