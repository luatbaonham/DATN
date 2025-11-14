import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AcademicYearService } from './academic-year.service';
import { AcademicYearFilterDto } from './dto/academic-year-filter.dto';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';
import { AcademicYearResponseDto } from './dto/academic-year-response.dto';
import { plainToInstance } from 'class-transformer';

@ApiBearerAuth()
@ApiTags('academic-years')
@Controller('academic-years')
export class AcademicYearController {
  constructor(private readonly academicYearService: AcademicYearService) {}

  // 🟩 Tạo mới
  @Post()
  @ApiOperation({ summary: 'Tạo niên khóa mới' })
  @ApiResponse({
    status: 201,
    description: 'Tạo niên khóa thành công',
    type: AcademicYearResponseDto,
  })
  async create(
    @Body() dto: CreateAcademicYearDto,
  ): Promise<AcademicYearResponseDto> {
    const result = await this.academicYearService.create(dto);
    return plainToInstance(AcademicYearResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách niên khóa (có phân trang)' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách niên khóa',
    type: [AcademicYearResponseDto],
  })
  async findAll(@Query() filter: AcademicYearFilterDto) {
    const result = await this.academicYearService.findAll(filter);
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết niên khóa theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết niên khóa',
    type: AcademicYearResponseDto,
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AcademicYearResponseDto> {
    const result = await this.academicYearService.findOne(id);
    return plainToInstance(AcademicYearResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin niên khóa' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: AcademicYearResponseDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAcademicYearDto,
  ): Promise<AcademicYearResponseDto> {
    const result = await this.academicYearService.update(id, dto);
    return plainToInstance(AcademicYearResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa niên khóa' })
  @ApiResponse({
    status: 200,
    description: 'Xóa thành công',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    const success = await this.academicYearService.remove(id);
    return { success };
  }
}
