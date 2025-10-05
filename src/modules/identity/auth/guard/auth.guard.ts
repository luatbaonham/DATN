import { Role } from '../../roles-permissions/entities/role.entity';
import { ConditionalModule, ConfigService } from '@nestjs/config';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/core';
import { User } from '@modules/identity/users/entities/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly em: EntityManager,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      const user = await this.em.findOne(
        User,
        { id: payload.id },
        { populate: ['userRoles.role.rolePermissions.permission'] },
      );
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      request.user = {
        id: user.id,
        email: user.email,
        roles: user.userRoles.getItems().map((ur) => ur.role.name),
        permissions: [
          ...new Set(
            user.userRoles
              .getItems()
              .flatMap((ur) =>
                ur.role.rolePermissions
                  .getItems()
                  .map(
                    (rp) => `${rp.permission.action}:${rp.permission.resource}`,
                  ),
              ),
          ),
        ], // mảng string, không phải Set<object>
      };
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
