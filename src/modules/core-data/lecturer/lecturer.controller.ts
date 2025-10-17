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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
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
  ApiConsumes,
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

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `lecturers-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(xlsx|xls|csv)$/)) {
          return callback(
            new BadRequestException('Chỉ chấp nhận file Excel (.xlsx, .xls)'),
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
    description: 'Upload file giảng viên thành công',
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
  async uploadLecturers(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file upload');
    }

    try {
      const result = await this.lecturerService.importFromExcel(file.path);

      return {
        message: 'Upload file giảng viên thành công',
        filename: file.originalname,
        path: file.path,
        size: file.size,
        ...result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Lỗi khi xử lý file upload';
      throw new BadRequestException(errorMessage);
    } finally {
      // Clean up uploaded file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
  }
}
