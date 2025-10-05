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
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseResponseDto } from './dto/course-response.dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '@modules/identity/auth/guard/auth.guard';
import { PermissionGuard } from '@modules/identity/auth/guard/permission.guard';
// import { Permissions } from 'src/common/decorators/permissions.decorator';

@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@ApiTags('courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Danh sách tất cả môn học',
    type: [CourseResponseDto],
  })
  async findAll(): Promise<CourseResponseDto[]> {
    const courses = await this.courseService.findAll();
    return plainToInstance(CourseResponseDto, courses, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Chi tiết môn học',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy môn học' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CourseResponseDto> {
    const course = await this.courseService.findOne(id);
    return plainToInstance(CourseResponseDto, course, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Tạo môn học thành công',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async create(
    @Body() createCourseDto: CreateCourseDto,
  ): Promise<CourseResponseDto> {
    const course = await this.courseService.create(createCourseDto);
    return plainToInstance(CourseResponseDto, course, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @ApiBody({ type: UpdateCourseDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật môn học thành công',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy môn học' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<CourseResponseDto> {
    const course = await this.courseService.update(id, updateCourseDto);
    return plainToInstance(CourseResponseDto, course, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Xóa môn học thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy môn học' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    const result = await this.courseService.remove(id);
    return { success: result };
  }
}
