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
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesPermissionsService } from './roles-per.service';
import { AssignPermissionDto } from './dto/assign-permisson.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AuthGuard } from '@modules/auth/guard/auth.guard';
import { PermissionGuard } from '@modules/auth/guard/permission.guard';
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
  @ApiResponse({ status: 200, description: 'Lấy tất cả role kèm permission' })
  async getRolesWithPermissions() {
    const roles = await this.service.getRolesWithPermissions();
    return { success: true, data: roles };
  }

  @Get('roles/:id')
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions('manage_roles:roles')
  @ApiResponse({ status: 200, description: 'Lấy chi tiết role kèm permission' })
  async getRoleWithPermissions(@Param('id', ParseIntPipe) roleId: number) {
    const role = await this.service.getRoleWithPermissions(roleId);
    return { success: true, data: role };
  }

  @Post('roles')
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions('manage_roles:roles')
  @ApiResponse({ status: 201, description: 'Tạo role mới' })
  async createRole(@Body() body: CreateRoleDto) {
    const role = await this.service.createRole(body);
    return { success: true, data: role };
  }

  @Put('roles/:id/permissions')
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions('manage_roles:roles')
  @ApiResponse({ status: 200, description: 'Gán permissions cho role' })
  async assignPermissions(
    @Param('id', ParseIntPipe) roleId: number,
    @Body() body: AssignPermissionDto,
  ) {
    return this.service.assignPermissions(roleId, body);
  }

  @Put('users/:id/roles')
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions('manage_roles:roles')
  @ApiResponse({ status: 200, description: 'Gán roles cho user' })
  async assignRoles(
    @Param('id', ParseIntPipe) userId: number,
    @Body() body: AssignRoleDto,
  ) {
    return this.service.assignRoles(userId, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions('manage_roles:roles')
  @ApiResponse({ status: 200, description: 'Xóa role thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy role' })
  @ApiResponse({
    status: 409,
    description: 'Role đang được gán cho người dùng',
  })
  async removeRole(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message }> {
    const result = await this.service.remove(id);
    return { message: result };
  }
}
