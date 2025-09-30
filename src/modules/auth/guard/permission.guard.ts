import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from 'src/common/decorators/permissions.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // không cần quyền gì thì cho qua
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userPermissions: string[] = user.permissions || [];

    // ✅ check tất cả quyền cần thiết
    const hasAll = requiredPermissions.every((rp) =>
      userPermissions.includes(rp),
    );

    if (!hasAll) {
      throw new ForbiddenException(
        `Missing required permission: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
