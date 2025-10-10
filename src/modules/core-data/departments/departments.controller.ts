// department.controller.ts
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
import { DepartmentService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';
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
import { DepartmentFilterDto } from './dto/department-filter.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@ApiTags('departments')
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'departmentCode', required: false, type: String })
  @ApiQuery({ name: 'departmentName', required: false, type: String })
  // @Permissions('manage_departments:departments')
  @ApiResponse({
    status: 200,
    description: 'Danh sách tất cả khoa',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query() filter: DepartmentFilterDto,
  ): Promise<PaginatedResponseDto<DepartmentResponseDto>> {
    return this.departmentService.findAll(filter);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Chi tiết khoa',
    type: DepartmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khoa' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DepartmentResponseDto> {
    const department = await this.departmentService.findOne(id);
    return plainToInstance(DepartmentResponseDto, department, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Tạo khoa thành công',
    type: DepartmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const department = await this.departmentService.create(createDepartmentDto);
    return plainToInstance(DepartmentResponseDto, department, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @ApiBody({ type: UpdateDepartmentDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật khoa thành công',
    type: DepartmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khoa' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const department = await this.departmentService.update(
      id,
      updateDepartmentDto,
    );
    return plainToInstance(DepartmentResponseDto, department, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Xóa khoa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khoa' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    const result = await this.departmentService.remove(id);
    return { success: result };
  }
}
