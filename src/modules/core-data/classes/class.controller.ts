// class.controller.ts
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
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassResponseDto } from './dto/class-response.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '@modules/identity/auth/guard/auth.guard';
import { PermissionGuard } from '@modules/identity/auth/guard/permission.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';

@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@ApiTags('classes')
@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get()
  @Permissions('manage_classes:classes')
  @ApiOperation({
    summary: 'Lấy danh sách lớp học',
    description: 'Trả về danh sách tất cả lớp học',
  })
  @ApiResponse({
    status: 200,
    description: '✅ Lấy thành công danh sách lớp học',
    type: [ClassResponseDto],
  })
  async findAll(): Promise<ClassResponseDto[]> {
    const classes = await this.classService.findAll();
    return plainToInstance(ClassResponseDto, classes, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết lớp học',
    description: 'Lấy thông tin chi tiết một lớp học theo ID',
  })
  @ApiResponse({
    status: 200,
    description: '✅ Lấy thành công thông tin lớp học',
    type: ClassResponseDto,
  })
  @ApiResponse({ status: 404, description: '❌ Không tìm thấy lớp học' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ClassResponseDto> {
    const classEntity = await this.classService.findOne(id);
    return plainToInstance(ClassResponseDto, classEntity, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @ApiOperation({
    summary: 'Tạo lớp học mới',
    description: 'Tạo một lớp học mới với dữ liệu được cung cấp',
  })
  @ApiResponse({
    status: 200,
    description: '✅ Tạo lớp học thành công',
    type: ClassResponseDto,
  })
  @ApiResponse({ status: 400, description: '❌ Dữ liệu không hợp lệ' })
  async create(
    @Body() createClassDto: CreateClassDto,
  ): Promise<ClassResponseDto> {
    const classEntity = await this.classService.create(createClassDto);
    return plainToInstance(ClassResponseDto, classEntity, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Cập nhật lớp học',
    description: 'Cập nhật thông tin lớp học theo ID',
  })
  @ApiBody({ type: UpdateClassDto })
  @ApiResponse({
    status: 200,
    description: '✅ Cập nhật lớp học thành công',
    type: ClassResponseDto,
  })
  @ApiResponse({ status: 404, description: '❌ Không tìm thấy lớp học' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassDto: UpdateClassDto,
  ): Promise<ClassResponseDto> {
    const classEntity = await this.classService.update(id, updateClassDto);
    return plainToInstance(ClassResponseDto, classEntity, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa lớp học',
    description: 'Xóa một lớp học theo ID',
  })
  @ApiResponse({ status: 200, description: '✅ Xóa lớp học thành công' })
  @ApiResponse({ status: 404, description: '❌ Không tìm thấy lớp học' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    const result = await this.classService.remove(id);
    return { success: result };
  }
}
