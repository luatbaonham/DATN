import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ConstraintService } from '../service/constraint.service';
import { Constraint } from '../entities/constraint.entity';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateConstraintDto } from '../dto/create-constraint.dto';
import { UpdateConstraintDto } from '../dto/update-constraint.dto';

@ApiTags('constraint')
@Controller('constraint')
export class ConstraintController {
  constructor(private readonly constraintService: ConstraintService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Danh sách các ràng buộc',
  })
  async findAll(): Promise<Constraint[]> {
    const constraint = await this.constraintService.findAll();
    return constraint;
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Chi tiết ràng buộc',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Constraint> {
    const constraint = await this.constraintService.findOne(id);
    return constraint;
  }

  @Post()
  @ApiBody({ type: CreateConstraintDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo ràng buộc thành công',
  })
  async create(@Body() dto: CreateConstraintDto): Promise<Constraint> {
    const constraint = await this.constraintService.create(dto);
    return constraint;
  }

  @Put(':id')
  @ApiBody({ type: UpdateConstraintDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật đăng ký học phần thành công',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConstraintDto,
  ): Promise<Constraint> {
    const constraint = await this.constraintService.update(id, dto);
    return constraint;
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Xóa ràng buộc thành công' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.constraintService.remove(id);
  }
}
