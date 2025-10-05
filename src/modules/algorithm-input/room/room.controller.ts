import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { RoomsService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomResponseDto } from './dto/room-ressponse.dto';
import { plainToInstance } from 'class-transformer';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';

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
  @ApiResponse({ status: 200, type: [RoomResponseDto] })
  async findAll(): Promise<RoomResponseDto[]> {
    const rooms = await this.service.findAll();
    return plainToInstance(RoomResponseDto, rooms, {
      excludeExtraneousValues: true,
    });
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
