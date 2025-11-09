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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  ApiConsumes,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '@modules/identity/auth/guard/auth.guard';
import { PermissionGuard } from '@modules/identity/auth/guard/permission.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { StudentFilterDto } from './dto/student-filter.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

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
  @ApiQuery({ name: 'className', required: false, type: String })
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

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // ← Thư mục lưu file (đảm bảo thư mục tồn tại)
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `students-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(xlsx|xls|csv)$/)) {
          return callback(
            new BadRequestException(
              'Chỉ chấp nhận file Excel/CSV (.xlsx, .xls, .csv)',
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Upload file thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        filename: { type: 'string' },
        path: { type: 'string' },
        size: { type: 'number' },
        imported: { type: 'number' },
        failed: { type: 'number' },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              row: { type: 'number' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file upload');
    }

    const result = await this.studentService.importFromExcel(file.path);

    return {
      message: 'Upload file thành công',
      filename: file.originalname,
      path: file.path,
      size: file.size,
      ...result,
    };
  }

  @Get('student/:studentId')
  async getStudentExam(@Param('studentId', ParseIntPipe) studentId: number) {
    return await this.studentService.getStudentExam(studentId);
  }
}
