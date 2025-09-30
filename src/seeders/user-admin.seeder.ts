// src/seeders/user-admin.seeder.ts
import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import * as bcrypt from 'bcrypt';
import { User } from '@modules/users/entities/user.entity';
import { Role } from '@modules/roles-permissions/entities/role.entity';
import { UserRole } from '@modules/users/entities/user-role.entity';

export class UserAdminSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const adminEmail = 'admin@example.com';

    // 1️⃣ Tìm role ADMIN (seed PermissionSeeder trước để có role này)
    const adminRole = await em.findOne(Role, { name: 'ADMIN' });
    if (!adminRole) {
      throw new Error(
        '⚠️ Role ADMIN chưa tồn tại. Hãy chạy PermissionSeeder trước.',
      );
    }

    // 2️⃣ Tạo user admin nếu chưa có
    let adminUser = await em.findOne(User, { email: adminEmail });
    if (!adminUser) {
      adminUser = new User();
      adminUser.firstName = 'Super';
      adminUser.lastName = 'Admin';
      adminUser.email = adminEmail;
      adminUser.password = await bcrypt.hash('admin123', 10);
      em.persist(adminUser);

      // 3️⃣ Gán role ADMIN cho user ngay lập tức
      const userRole = new UserRole();
      userRole.user = adminUser;
      userRole.role = adminRole;
      em.persist(userRole);

      await em.flush();

      console.log(`✅ Đã tạo user ${adminEmail} / admin123 với role ADMIN`);
    } else {
      console.log(`ℹ️ User ${adminEmail} đã tồn tại`);
    }
  }
}
