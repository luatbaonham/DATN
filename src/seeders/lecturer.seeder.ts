import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { Lecturer } from '@modules/core-data/lecturer/entities/lecturer.entity';
import { Department } from '@modules/core-data/departments/entities/department.entity';
import { User } from '@modules/identity/users/entities/user.entity';
import { Role } from '@modules/identity/roles-permissions/entities/role.entity';
import { UserRole } from '@modules/identity/users/entities/user-role.entity';
import * as bcrypt from 'bcrypt';

export class LecturerSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const department = await em.findOne(Department, { departmentCode: 'CNTT' });
    if (!department) throw new Error('Không tìm thấy khoa CNTT');

    const role = await em.findOne(Role, { name: 'GIANG_VIEN' });
    if (!role) throw new Error('Không tìm thấy role GIANG_VIEN');

    const lecturers = [
      {
        lecturerCode: 'GV001',
        firstName: 'Nguyễn',
        lastName: 'Thành',
        dateOfBirth: new Date('1980-04-15'),
        gender: 'male',
        address: '789 Trường Chinh, TP.HCM',
        phoneNumber: '0901122334',
        isSupervisor: false,
      },
      {
        lecturerCode: 'GV002',
        firstName: 'Lê',
        lastName: 'Mai',
        dateOfBirth: new Date('1985-09-20'),
        gender: 'female',
        address: '321 Phan Văn Trị, TP.HCM',
        phoneNumber: '0905566778',
        isSupervisor: false,
      },
    ];

    for (const dto of lecturers) {
      const exist = await em.findOne(Lecturer, {
        lecturerCode: dto.lecturerCode,
      });
      if (exist) continue;

      const email = `${dto.lecturerCode.toLowerCase()}@lecturer.ptithcm.vn`;
      const password = await bcrypt.hash(dto.lecturerCode, 10);

      const user = em.create(User, { email, password });
      const userRole = em.create(UserRole, { user, role });
      const lecturer = em.create(Lecturer, {
        ...dto,
        user,
        department,
      });

      // Đánh dấu tất cả entity cần lưu
      em.persist([user, userRole, lecturer]);
    }

    // Ghi toàn bộ xuống DB 1 lần
    await em.flush();

    console.log('✅ LecturerSeeder: Tạo giảng viên thành công!');
  }
}
