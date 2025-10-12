import { Seeder } from '@mikro-orm/seeder';
import { PermissionSeeder } from './permission.seeder';
import { EntityManager } from '@mikro-orm/core';
import { UserSeeder } from './user.seeder';
import { UserAdminSeeder } from './user-admin.seeder';
import { LocationSeeder } from './location.seeder';
import { DepartmentSeeder } from './department.seeder';
import { ClassSeeder } from './class.seeder';
import { RoomSeeder } from './room.seed';
import { StudentSeeder } from './student.seeder';
import { LecturerSeeder } from './lecturer.seeder';

export class Dbseeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    await this.call(em, [
      PermissionSeeder,
      UserSeeder,
      UserAdminSeeder,
      LocationSeeder,
      DepartmentSeeder,
      ClassSeeder,
      RoomSeeder,
      StudentSeeder,
      LecturerSeeder,
    ]);
  }
}
// chạy lệnh: npx mikro-orm seeder:run
// chạy riêng: npx mikro-orm seeder:run --class=PermissionSeeder

// chạy để fresh db: npx mikro-orm schema:fresh --run
// nếu có thay đổi entity thì chạy lệnh: npx mikro-orm migration:create rồi up
