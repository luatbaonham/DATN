import { Role } from '@modules/identity/roles-permissions/entities/role.entity';

export function mapRole(role: Role) {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    permissions: role.rolePermissions.getItems().map((rp) => ({
      id: rp.permission.id,
      action: rp.permission.action,
      resource: rp.permission.resource,
      description: rp.permission.description,
    })),
  };
}
