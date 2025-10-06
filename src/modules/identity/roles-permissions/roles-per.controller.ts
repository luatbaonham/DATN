import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesPermissionsService } from './roles-per.service';
import { AssignPermissionDto } from './dto/assign-permisson.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AuthGuard } from '@modules/identity/auth/guard/auth.guard';
import { PermissionGuard } from '@modules/identity/auth/guard/permission.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { CreateRoleDto } from './dto/create-role.dto';

@ApiTags('roles-permissions')
@ApiBearerAuth()
@Controller('roles-permissions')
export class RolesPermissionsController {
  constructor(private readonly service: RolesPermissionsService) {}

  @Get('roles')
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions('manage_roles:roles')
  @ApiOperation({
    summary: 'Lấy tất cả roles',
    description: 'Trả về danh sách tất cả roles cùng các permission kèm theo',
  })
  @ApiResponse({
    status: 200,
    description: '✅ **Lấy thành công danh sách roles**',
  })
  async getRolesWithPermissions() {
    const roles = await this.service.getRolesWithPermissions();
    return { success: true, data: roles };
  }

  @Get('roles/:id')
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions('manage_roles:roles')
  @ApiOperation({
    summary: 'Lấy chi tiết role',
    description: 'Lấy thông tin chi tiết một role cùng các permission của nó',
  })
  @ApiResponse({
    status: 200,
    description: '✅ **Lấy thành công role**',
  })
  @ApiResponse({ status: 404, description: '❌ **Role không tồn tại**' })
  async getRoleWithPermissions(@Param('id', ParseIntPipe) roleId: number) {
    const role = await this.service.getRoleWithPermissions(roleId);
    return { success: true, data: role };
  }

  @Post('roles')
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions('manage_roles:roles')
  @ApiOperation({
    summary: 'Tạo role mới',
    description: 'Tạo một role mới với thông tin được cung cấp',
  })
  @ApiResponse({
    status: 200,
    description: '✅ **Role được tạo thành công**',
  })
  @ApiResponse({
    status: 400,
    description: '❌ **Dữ liệu không hợp lệ**',
  })
  async createRole(@Body() body: CreateRoleDto) {
    const role = await this.service.createRole(body);
    return { success: true, data: role };
  }

  @Put('roles/:id/permissions')
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions('manage_roles:roles')
  @ApiOperation({
    summary: 'Gán permissions cho role',
    description: 'Cập nhật danh sách permissions cho một role',
  })
  @ApiResponse({
    status: 200,
    description: '✅ **Gán permissions thành công**',
  })
  @ApiResponse({
    status: 404,
    description: '❌ **Role không tồn tại**',
  })
  async assignPermissions(
    @Param('id', ParseIntPipe) roleId: number,
    @Body() body: AssignPermissionDto,
  ) {
    return this.service.assignPermissions(roleId, body);
  }

  @Put('users/:id/roles')
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions('manage_roles:roles')
  @ApiOperation({
    summary: 'Gán roles cho user',
    description: 'Gán một hoặc nhiều role cho user cụ thể',
  })
  @ApiResponse({
    status: 200,
    description: '✅ **Gán roles thành công**',
  })
  @ApiResponse({
    status: 404,
    description: '❌ **User hoặc role không tồn tại**',
  })
  async assignRoles(
    @Param('id', ParseIntPipe) userId: number,
    @Body() body: AssignRoleDto,
  ) {
    return this.service.assignRoles(userId, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions('manage_roles:roles')
  @ApiOperation({
    summary: 'Xóa role',
    description: 'Xóa một role. Nếu role đang được gán cho user sẽ báo lỗi',
  })
  @ApiResponse({
    status: 200,
    description: '✅ **Xóa role thành công**',
  })
  @ApiResponse({
    status: 404,
    description: '❌ **Role không tồn tại**',
  })
  @ApiResponse({
    status: 409,
    description: '❌ **Role đang được gán cho người dùng**',
  })
  async removeRole(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message }> {
    const result = await this.service.remove(id);
    return { message: result };
  }
}
