// student.controller.ts
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
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentResponseDto } from './dto/student-response.dto';
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
import { StudentFilterDto } from './dto/student-filter.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@ApiTags('students')
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'studentCode', required: false, type: String })
  @ApiQuery({ name: 'fullName', required: false, type: String })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiQuery({ name: 'classId', required: false, type: Number })
  @ApiQuery({ name: 'gender', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sinh viên có phân trang và lọc',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query() filter: StudentFilterDto,
  ): Promise<PaginatedResponseDto<StudentResponseDto>> {
    return this.studentService.findAll(filter);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Chi tiết sinh viên',
    type: StudentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sinh viên' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StudentResponseDto> {
    const student = await this.studentService.findOne(id);
    return plainToInstance(StudentResponseDto, student, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Tạo sinh viên thành công',
    type: StudentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async create(
    @Body() createStudentDto: CreateStudentDto,
  ): Promise<StudentResponseDto> {
    const student = await this.studentService.create(createStudentDto);
    return plainToInstance(StudentResponseDto, student, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @ApiBody({ type: UpdateStudentDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật sinh viên thành công',
    type: StudentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sinh viên' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<StudentResponseDto> {
    const student = await this.studentService.update(id, updateStudentDto);
    return plainToInstance(StudentResponseDto, student, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Xóa sinh viên thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sinh viên' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    const result = await this.studentService.remove(id);
    return { success: result };
  }
}
