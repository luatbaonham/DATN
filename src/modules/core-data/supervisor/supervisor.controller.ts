// supervisor.controller.ts
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
import { SupervisorService } from './supervisor.service';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';
import { SupervisorResponseDto } from './dto/supervisor-response.dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '@modules/auth/guard/auth.guard';
import { PermissionGuard } from '@modules/auth/guard/permission.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';

@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@ApiTags('supervisors')
@Controller('supervisors')
export class SupervisorController {
  constructor(private readonly supervisorService: SupervisorService) {}

  @Get()
  @Permissions('manage_supervisors:supervisors')
  @ApiResponse({
    status: 200,
    description: 'Danh sách tất cả hồ sơ giám thị',
    type: [SupervisorResponseDto],
  })
  async findAll(): Promise<SupervisorResponseDto[]> {
    const supervisors = await this.supervisorService.findAll();
    return plainToInstance(SupervisorResponseDto, supervisors, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Chi tiết hồ sơ giám thị',
    type: SupervisorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ giám thị' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SupervisorResponseDto> {
    const supervisor = await this.supervisorService.findOne(id);
    return plainToInstance(SupervisorResponseDto, supervisor, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Tạo hồ sơ giám thị thành công',
    type: SupervisorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async create(
    @Body() createSupervisorDto: CreateSupervisorDto,
  ): Promise<SupervisorResponseDto> {
    const supervisor = await this.supervisorService.create(createSupervisorDto);
    return plainToInstance(SupervisorResponseDto, supervisor, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @ApiBody({ type: UpdateSupervisorDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật hồ sơ giám thị thành công',
    type: SupervisorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ giám thị' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupervisorDto: UpdateSupervisorDto,
  ): Promise<SupervisorResponseDto> {
    const supervisor = await this.supervisorService.update(
      id,
      updateSupervisorDto,
    );
    return plainToInstance(SupervisorResponseDto, supervisor, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Xóa hồ sơ giám thị thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ giám thị' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    const result = await this.supervisorService.remove(id);
    return { success: result };
  }
}
