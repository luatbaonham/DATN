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
} from '@nestjs/common';
import { LecturerService } from './lecturer.service';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';
import { LecturerResponseDto } from './dto/lecturer-response.dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '@modules/identity/auth/guard/auth.guard';
import { PermissionGuard } from '@modules/identity/auth/guard/permission.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';

@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@ApiTags('lecturers')
@Controller('lecturers')
export class LecturerController {
  constructor(private readonly lecturerService: LecturerService) {}

  @Get()
  @Permissions('manage_lecturers:lecturers')
  @ApiResponse({
    status: 200,
    description: 'Danh sách tất cả hồ sơ giảng viên',
    type: [LecturerResponseDto],
  })
  async findAll(): Promise<LecturerResponseDto[]> {
    const lecturers = await this.lecturerService.findAll();
    return plainToInstance(LecturerResponseDto, lecturers, {
      excludeExtraneousValues: true,
    });
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
