import { Module } from '@nestjs/common';
import { RolesPermissionsController } from './roles-per.controller';
import { RolesPermissionsService } from './roles-per.service';
import { AuthGuard } from '@modules/identity/auth/guard/auth.guard';
import { PermissionGuard } from '@modules/identity/auth/guard/permission.guard';

@Module({
  controllers: [RolesPermissionsController],
  providers: [RolesPermissionsService, AuthGuard, PermissionGuard],
  exports: [RolesPermissionsService],
})
export class RolesPermissionsModule {}
