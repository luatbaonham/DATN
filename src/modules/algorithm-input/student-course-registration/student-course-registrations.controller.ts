import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import { StudentCourseRegistrationsService } from './student-course-registrations.service';
import { CreateStudentCourseRegistrationDto } from './dto/create-student-course-registration.dto';
import { UpdateStudentCourseRegistrationDto } from './dto/update-student-course-registration.dto';
import { StudentCourseRegistrationResponseDto } from './dto/student-course-registration-response.dto';
import { plainToInstance } from 'class-transformer';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('student-course-registrations')
@Controller('student-course-registrations')
export class StudentCourseRegistrationsController {
  constructor(private readonly service: StudentCourseRegistrationsService) {}

  @Post()
  @ApiBody({ type: CreateStudentCourseRegistrationDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo đăng ký học phần thành công',
    type: StudentCourseRegistrationResponseDto,
  })
  async create(
    @Body() dto: CreateStudentCourseRegistrationDto,
  ): Promise<StudentCourseRegistrationResponseDto> {
    const reg = await this.service.create(dto);
    return plainToInstance(StudentCourseRegistrationResponseDto, reg, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Danh sách đăng ký học phần',
    type: [StudentCourseRegistrationResponseDto],
  })
  async findAll(): Promise<StudentCourseRegistrationResponseDto[]> {
    const regs = await this.service.findAll();
    return plainToInstance(StudentCourseRegistrationResponseDto, regs, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Chi tiết đăng ký học phần',
    type: StudentCourseRegistrationResponseDto,
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StudentCourseRegistrationResponseDto> {
    const reg = await this.service.findOne(id);
    return plainToInstance(StudentCourseRegistrationResponseDto, reg, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @ApiBody({ type: UpdateStudentCourseRegistrationDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật đăng ký học phần thành công',
    type: StudentCourseRegistrationResponseDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentCourseRegistrationDto,
  ): Promise<StudentCourseRegistrationResponseDto> {
    const reg = await this.service.update(id, dto);
    return plainToInstance(StudentCourseRegistrationResponseDto, reg, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Xóa đăng ký học phần thành công' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
