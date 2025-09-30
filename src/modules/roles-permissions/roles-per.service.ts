import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { User } from '@modules/users/entities/user.entity';
import { UserRole } from '@modules/users/entities/user-role.entity';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AssignPermissionDto } from './dto/assign-permisson.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { mapRole } from 'src/common/utils/map-role.utils';

@Injectable()
export class RolesPermissionsService {
  constructor(private readonly em: EntityManager) {}
  async getRolesWithPermissions() {
    const roles = await this.em.find(
      Role,
      {},
      {
        populate: ['rolePermissions.permission'],
      },
    );
    console.log(roles);
    return roles.map(mapRole);
  }

  async getRoleWithPermissions(id: number) {
    const role = await this.em.findOne(
      Role,
      { id },
      {
        populate: ['rolePermissions.permission'],
      },
    );

    if (!role) throw new NotFoundException('Role not found');
    console.log(role);
    return mapRole(role);
  }
  //hàm trên return có map vì nó là find mảng, hàm dưới return thẳng vì nó là findOne

  async createRole(dto: CreateRoleDto) {
    const role = this.em.create(Role, dto);
    await this.em.persistAndFlush(role);
    return role;
  }

  async assignPermissions(roleId: number, dto: AssignPermissionDto) {
    const role = await this.em.findOne(Role, { id: roleId });
    if (!role) throw new NotFoundException('Role not found');

    const permissions = await this.em.find(Permission, {
      id: { $in: dto.permissionIds },
    });

    for (const perm of permissions) {
      const rolePerm = await this.em.findOne(RolePermission, {
        role,
        permission: perm,
      });
      if (!rolePerm) this.em.create(RolePermission, { role, permission: perm });
    }

    await this.em.flush();
    return { success: true, message: 'Permissions assigned' };
  }

  async assignRoles(userId: number, dto: AssignRoleDto) {
    const user = await this.em.findOne(
      User,
      { id: userId },
      { populate: ['userRoles'] },
    );
    if (!user) throw new NotFoundException('User not found');

    const roles = await this.em.find(Role, { id: { $in: dto.roleIds } });

    // clear old roles
    user.userRoles.getItems().forEach((ur) => this.em.remove(ur));

    // assign new
    for (const role of roles) {
      this.em.create(UserRole, { user, role });
    }

    await this.em.flush();
    return { success: true, message: 'Gán role cho user thành công' };
  }

  async remove(id: number): Promise<{ message }> {
    const role = await this.em.findOne(Role, { id });
    if (!role) throw new NotFoundException('Không tìm thấy role');

    // Kiểm tra xem có user nào đang dùng role này không
    const count = await this.em.count(UserRole, { role });
    if (count > 0) {
      throw new ConflictException(
        'Role đang được gán cho người dùng, không thể xóa',
      );
    }

    // Xóa các bản ghi gán permission cho role này
    await this.em.transactional(async (em) => {
      await em.nativeDelete(RolePermission, { role: { id } });
      await em.removeAndFlush(role);
    });

    return { message: 'Xoá role thành công' };
  }
}
