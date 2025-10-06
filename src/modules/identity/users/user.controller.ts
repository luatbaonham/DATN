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
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '@modules/identity/auth/guard/auth.guard';
import { PermissionGuard } from '@modules/identity/auth/guard/permission.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import {
  AuthUser,
  CurrentUser,
} from 'src/common/decorators/current-user.decorator';

@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Permissions('manage_users:users')
  @ApiOperation({
    summary: 'Lấy danh sách user',
    description: 'Trả về danh sách tất cả user kèm thông tin role',
  })
  @ApiResponse({
    status: 200,
    description: '✅ Lấy thành công danh sách user',
    type: [UserResponseDto],
  })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userService.findAll();
    //
    const transformed = users.map((user) => {
      const roles = user.userRoles?.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
        description: ur.role.description,
      })); // lấy role từ userRoles
      return {
        ...user,
        roles,
      };
    });
    return plainToInstance(UserResponseDto, transformed, {
      excludeExtraneousValues: true,
    });
  }

  @Get('profile')
  @ApiOperation({
    summary: 'Thông tin user hiện tại',
    description: 'Lấy thông tin profile của user đang đăng nhập',
  })
  @ApiResponse({ status: 200, description: '✅ Lấy thành công thông tin user' })
  async getProfile(@CurrentUser() user: AuthUser): Promise<any> {
    return this.userService.getProfileByUserId(Number(user.id)); // ✅ ép sang number
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết user',
    description: 'Lấy thông tin chi tiết một user theo ID',
  })
  @ApiResponse({
    status: 200,
    description: '✅ Lấy thành công thông tin user',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: '❌ Không tìm thấy user' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    const user = await this.userService.findOne(id);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @ApiOperation({
    summary: 'Tạo user mới',
    description: 'Tạo một user mới với dữ liệu được cung cấp',
  })
  @ApiResponse({
    status: 200,
    description: '✅ Tạo user thành công',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: '❌ Dữ liệu không hợp lệ' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.create(createUserDto);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Cập nhật user',
    description: 'Cập nhật thông tin user theo ID',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: '✅ Cập nhật user thành công',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: '❌ Không tìm thấy user' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userService.update(id, updateUserDto);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa user',
    description: 'Xóa một user theo ID',
  })
  @ApiResponse({ status: 200, description: '✅ Xóa user thành công' })
  @ApiResponse({ status: 404, description: '❌ Không tìm thấy user' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    const result = await this.userService.remove(id);
    return { success: result };
  }
}
