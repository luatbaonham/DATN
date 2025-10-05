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
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-locations.dto';
import { UpdateLocationsDto } from './dto/update-locations.dto';
import { LocationResponseDto } from './dto/locations-response.dto';
import { plainToInstance } from 'class-transformer';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly service: LocationsService) {}

  @Post()
  @ApiBody({ type: CreateLocationDto })
  @ApiResponse({ status: 201, type: LocationResponseDto })
  async create(@Body() dto: CreateLocationDto): Promise<LocationResponseDto> {
    const location = await this.service.create(dto);
    return plainToInstance(LocationResponseDto, location, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiResponse({ status: 200, type: [LocationResponseDto] })
  async findAll(): Promise<LocationResponseDto[]> {
    const locations = await this.service.findAll();
    return plainToInstance(LocationResponseDto, locations, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: LocationResponseDto })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LocationResponseDto> {
    const location = await this.service.findOne(id);
    return plainToInstance(LocationResponseDto, location, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @ApiBody({ type: UpdateLocationsDto })
  @ApiResponse({ status: 200, type: LocationResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLocationsDto,
  ): Promise<LocationResponseDto> {
    const location = await this.service.update(id, dto);
    return plainToInstance(LocationResponseDto, location, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Xóa cơ sở thành công' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return { success: await this.service.remove(id) };
  }
}
