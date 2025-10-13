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
import { ConstraintRuleService } from '../service/constraint-rule.service';
import { ConstraintRule } from '../entities/constraint-rule.entity';
import { CreateConstraintRuleDto } from '../dto/create-constraint-rule.dto';
import { UpdateConstraintRuleDto } from '../dto/update-constraint-rule.dto';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('constraint-rules')
@Controller('constraint-rules')
export class ConstraintRuleController {
  constructor(private readonly ruleService: ConstraintRuleService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Danh sách các ConstraintRule' })
  async findAll(): Promise<ConstraintRule[]> {
    return this.ruleService.findAll();
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Chi tiết một ConstraintRule' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ConstraintRule> {
    return this.ruleService.findOne(id);
  }

  @Post()
  @ApiBody({ type: CreateConstraintRuleDto })
  @ApiResponse({ status: 201, description: 'Tạo ConstraintRule thành công' })
  async create(@Body() dto: CreateConstraintRuleDto): Promise<ConstraintRule> {
    return this.ruleService.create(dto);
  }

  @Put(':id')
  @ApiBody({ type: UpdateConstraintRuleDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật ConstraintRule thành công',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConstraintRuleDto,
  ): Promise<ConstraintRule> {
    return this.ruleService.update(id, dto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Xóa ConstraintRule thành công' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.ruleService.remove(id);
  }
}
