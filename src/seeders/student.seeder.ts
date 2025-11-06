import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { Student } from '@modules/core-data/students/entities/student.entity';
import { Classes } from '@modules/core-data/classes/entities/class.entity';
import { User } from '@modules/identity/users/entities/user.entity';
import { Role } from '@modules/identity/roles-permissions/entities/role.entity';
import { UserRole } from '@modules/identity/users/entities/user-role.entity';
import * as bcrypt from 'bcrypt';

export class StudentSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const classes = await em.findOne(Classes, { classCode: 'CNTT01' });
    if (!classes) throw new Error('Không tìm thấy lớp CNTT01');

    const role = await em.findOne(Role, { name: 'SINH_VIEN' });
    if (!role) throw new Error('Không tìm thấy role SINH_VIEN');

    const students = [
      {
        studentCode: 'SV999',
        firstName: 'Lê',
        lastName: 'Minh',
        dateOfBirth: new Date('2003-05-10'),
        gender: 'male',
        address: '123 Lê Văn Việt',
        phoneNumber: '0901234567',
      },
      {
        studentCode: 'SV1000',
        firstName: 'Phạm',
        lastName: 'Thảo',
        dateOfBirth: new Date('2003-08-22'),
        gender: 'female',
        address: '456 Xa Lộ Hà Nội',
        phoneNumber: '0907654321',
      },
    ];

    for (const data of students) {
      const exist = await em.findOne(Student, {
        studentCode: data.studentCode,
      });
      if (exist) continue;

      const email = `${data.studentCode.toLowerCase()}@edu.ptithcm.vn`;
      const password = await bcrypt.hash(data.studentCode, 10);

      const user = em.create(User, { email, password });
      const userRole = em.create(UserRole, { user, role });
      const student = em.create(Student, {
        ...data,
        user,
        classes,
      });

      // Chỉ persist, KHÔNG flush ở đây
      em.persist([user, userRole, student]);
    }

    // Flush toàn bộ 1 lần cuối
    await em.flush();

    console.log('✅ StudentSeeder: Tạo sinh viên thành công!');
  }
}
