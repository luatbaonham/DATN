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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CourseDepartmentService } from './course-department.service';
import { CreateCourseDepartmentDto } from './dto/create-course-department.dto';
import { UpdateCourseDepartmentDto } from './dto/update-course-department.dto';
import { CourseDepartmentFilterDto } from './dto/course-department-filter.dto';
import { CourseDepartmentResponseDto } from './dto/course-department-response.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { plainToInstance } from 'class-transformer';

@ApiBearerAuth()
@ApiTags('course-departments')
@Controller('course-departments')
export class CourseDepartmentController {
  constructor(private readonly service: CourseDepartmentService) {}

  // 🟩 Tạo mới
  @Post()
  @ApiOperation({ summary: 'Tạo mới liên kết môn - khoa - đợt thi' })
  @ApiBody({ type: CreateCourseDepartmentDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo liên kết thành công',
    type: CourseDepartmentResponseDto,
  })
  async create(
    @Body() dto: CreateCourseDepartmentDto,
  ): Promise<CourseDepartmentResponseDto> {
    const record = await this.service.create(dto);
    return plainToInstance(CourseDepartmentResponseDto, record, {
      excludeExtraneousValues: true,
    });
  }

  // 🟦 Danh sách phân trang
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách liên kết phân trang' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách liên kết môn - khoa - đợt thi',
    type: PaginatedResponseDto<CourseDepartmentResponseDto>,
  })
  async findAll(
    @Query() filter: CourseDepartmentFilterDto,
  ): Promise<PaginatedResponseDto<CourseDepartmentResponseDto>> {
    const result = await this.service.findAll(filter);
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết liên kết môn - khoa - đợt thi' })
  @ApiResponse({
    status: 200,
    type: CourseDepartmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bản ghi' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CourseDepartmentResponseDto> {
    const record = await this.service.findOne(id);
    return plainToInstance(CourseDepartmentResponseDto, record, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật liên kết môn - khoa - đợt thi' })
  @ApiBody({ type: UpdateCourseDepartmentDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: CourseDepartmentResponseDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseDepartmentDto,
  ): Promise<CourseDepartmentResponseDto> {
    const record = await this.service.update(id, dto);
    return plainToInstance(CourseDepartmentResponseDto, record, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá liên kết môn - khoa - đợt thi' })
  @ApiResponse({ status: 200, description: 'Xoá bản ghi thành công' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    const result = await this.service.remove(id);
    return { success: result };
  }
}
