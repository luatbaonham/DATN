import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { RoomsService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomResponseDto } from './dto/room-ressponse.dto';
import { plainToInstance } from 'class-transformer';
import { ApiTags, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { RoomFilterDto } from './dto/room-filter.dto';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly service: RoomsService) {}

  @Post()
  @ApiBody({ type: CreateRoomDto })
  @ApiResponse({ status: 201, type: RoomResponseDto })
  async create(@Body() dto: CreateRoomDto): Promise<RoomResponseDto> {
    const room = await this.service.create(dto);
    return plainToInstance(RoomResponseDto, room, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'code', required: false, type: String })
  @ApiQuery({ name: 'locationName', required: false, type: String })
  @ApiQuery({ name: 'capacity_min', required: false, type: Number })
  @ApiQuery({ name: 'capacity_max', required: false, type: Number })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  async findAll(
    @Query() filter: RoomFilterDto,
  ): Promise<PaginatedResponseDto<RoomResponseDto>> {
    return this.service.findAll(filter);
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: RoomResponseDto })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RoomResponseDto> {
    const room = await this.service.findOne(id);
    return plainToInstance(RoomResponseDto, room, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @ApiBody({ type: UpdateRoomDto })
  @ApiResponse({ status: 200, type: RoomResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoomDto,
  ): Promise<RoomResponseDto> {
    const room = await this.service.update(id, dto);
    return plainToInstance(RoomResponseDto, room, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Xóa phòng thành công' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return { success: await this.service.remove(id) };
  }
}
