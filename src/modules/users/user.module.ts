import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { Permission } from '../roles-permissions/entities/permission.entity';
import { RolePermission } from '@modules/roles-permissions/entities/role-permission.entity';
import { Role } from '../roles-permissions/entities/role.entity';
import { UserRole } from './entities/user-role.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      User,
      Role,
      Permission,
      UserRole,
      RolePermission,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
