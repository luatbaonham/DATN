// lecturer.controller.ts
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
import { LecturerService } from './lecturer.service';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';
import { LecturerResponseDto } from './dto/lecturer-response.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '@modules/identity/auth/guard/auth.guard';
import { PermissionGuard } from '@modules/identity/auth/guard/permission.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { LecturerFilterDto } from './dto/lecturer-filter.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@ApiTags('lecturers')
@Controller('lecturers')
export class LecturerController {
  constructor(private readonly lecturerService: LecturerService) {}

  @Get()
  @Permissions('manage_lecturers:lecturers')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'lecturerCode', required: false, type: String })
  @ApiQuery({ name: 'fullName', required: false, type: String })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Danh sách giảng viên có phân trang và lọc',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query() filter: LecturerFilterDto,
  ): Promise<PaginatedResponseDto<LecturerResponseDto>> {
    return this.lecturerService.findAll(filter);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Chi tiết hồ sơ giảng viên',
    type: LecturerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ giảng viên' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LecturerResponseDto> {
    const lecturer = await this.lecturerService.findOne(id);
    return plainToInstance(LecturerResponseDto, lecturer, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Tạo hồ sơ giảng viên thành công',
    type: LecturerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async create(
    @Body() createLecturerDto: CreateLecturerDto,
  ): Promise<LecturerResponseDto> {
    const lecturer = await this.lecturerService.create(createLecturerDto);
    return plainToInstance(LecturerResponseDto, lecturer, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @ApiBody({ type: UpdateLecturerDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật hồ sơ giảng viên thành công',
    type: LecturerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ giảng viên' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLecturerDto: UpdateLecturerDto,
  ): Promise<LecturerResponseDto> {
    const lecturer = await this.lecturerService.update(id, updateLecturerDto);
    return plainToInstance(LecturerResponseDto, lecturer, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Xóa hồ sơ giảng viên thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ giảng viên' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    const result = await this.lecturerService.remove(id);
    return { success: result };
  }
}
