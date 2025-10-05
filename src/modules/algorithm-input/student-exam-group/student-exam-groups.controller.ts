import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { StudentExamGroupsService } from './student-exam-group.service';
import { CreateStudentExamGroupDto } from './dto/create-student-exam-group.dto';
import { UpdateStudentExamGroupDto } from './dto/update-student-exam-group.dto';
import { StudentExamGroupResponseDto } from './dto/student-exam-group-response.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Student Exam Groups')
@Controller('student-exam-groups')
export class StudentExamGroupsController {
  constructor(private readonly service: StudentExamGroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Thêm sinh viên vào nhóm thi' })
  @ApiResponse({ status: 201, type: StudentExamGroupResponseDto })
  create(@Body() dto: CreateStudentExamGroupDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sinh viên trong các nhóm thi' })
  @ApiResponse({ status: 200, type: [StudentExamGroupResponseDto] })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết sinh viên trong nhóm thi' })
  @ApiResponse({ status: 200, type: StudentExamGroupResponseDto })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin sinh viên trong nhóm thi' })
  @ApiResponse({ status: 200, type: StudentExamGroupResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateStudentExamGroupDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa (set inactive) sinh viên khỏi nhóm thi' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
