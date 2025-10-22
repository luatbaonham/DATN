// src/seeds/init-data.seeder.ts
import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';

import { Locations } from '@modules/algorithm-input/location/entities/locations.entity';
import { Role } from '@modules/identity/roles-permissions/entities/role.entity';
import { Permission } from '@modules/identity/roles-permissions/entities/permission.entity';
import { User } from '@modules/identity/users/entities/user.entity';
import { Department } from '@modules/core-data/departments/entities/department.entity';
import { Classes } from '@modules/core-data/classes/entities/class.entity';
import { Lecturer } from '@modules/core-data/lecturer/entities/lecturer.entity';
import { Student } from '@modules/core-data/students/entities/student.entity';
import { Course } from '@modules/algorithm-input/course/entities/course.entity';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';
import { StudentCourseRegistration } from '@modules/algorithm-input/student-course-registration/entities/student-course-registration.entity';
import { ExamGroup } from '@modules/algorithm-input/exam-group/entities/exam-group.entity';
import { StudentExamGroup } from '@modules/algorithm-input/student-exam-group/entities/student-exam-group.entity';
import { Room } from '@modules/algorithm-input/room/entities/room.entity';
import { ExamSlot } from '@modules/result/exam-slot/entities/exam-slot.entity';
import { Exam } from '@modules/result/exam/entities/exam.entity';
import { ExamRegistration } from '@modules/result/exam-registration/entities/exam-registration.entity';
import { ExamSupervisor } from '@modules/result/exam-supervisor/entities/exam-supervisor.entity';

// Các Seeder con
import { PermissionSeeder } from './permission.seeder';
import { LocationSeeder } from './location.seeder';
import { LecturerSeeder } from './lecturer.seeder';
import { StudentSeeder } from './student.seeder';
import { DepartmentSeeder } from './department.seeder';
import { ClassSeeder } from './class.seeder';
import { RoomSeeder } from './room.seed';
import { UserAdminSeeder } from './user-admin.seeder';

export class InitSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('🌱 Bắt đầu seed dữ liệu mẫu...');

    await this.call(em, [UserAdminSeeder]);
    // 1️⃣ Role & Permission
    await this.call(em, [PermissionSeeder]);
    console.log('✅ Đã seed Role & Permission');

    // 2️⃣ Location
    await this.call(em, [LocationSeeder]);
    const location = await em.findOneOrFail(Locations, { code: 'CS001' });
    console.log('✅ Đã seed Location:', location.name);

    // 3️⃣ Department
    await this.call(em, [DepartmentSeeder]);
    const department = await em.findOneOrFail(Department, {
      departmentCode: 'CNTT',
    });
    console.log('✅ Đã seed Department:', department.departmentName);

    // 4️⃣ Class
    await this.call(em, [ClassSeeder]);
    const classEntity = await em.findOneOrFail(Classes, {
      classCode: 'CNTT01',
    });
    console.log('✅ Đã seed Class:', classEntity.className);

    // 5️⃣ Lecturer
    await this.call(em, [LecturerSeeder]);
    const lecturer = await em.findOneOrFail(Lecturer, {
      lecturerCode: 'GV001',
    });
    console.log('✅ Đã seed Lecturer:');

    // 6️⃣ Student
    await this.call(em, [StudentSeeder]);
    const student = await em.findOneOrFail(Student, { studentCode: 'SV001' });
    console.log('✅ Đã seed Student:');

    // 7️⃣ Room
    await this.call(em, [RoomSeeder]);
    const room = await em.findOneOrFail(Room, { code: 'P101' });
    console.log('✅ Đã seed Room:');

    // 8️⃣ Course
    const course = em.create(Course, {
      codeCourse: 'CT101',
      nameCourse: 'Nhập môn Công nghệ Thông tin',
      description: 'Giới thiệu các khái niệm cơ bản về CNTT',
      credits: 3,
      expected_students: 100,
      is_active: true,
    });
    await em.persistAndFlush(course);
    console.log('✅ Đã seed Course:', course.nameCourse);

    // 9️⃣ Exam Session
    const examSession = em.create(ExamSession, {
      name: 'Học kỳ 1 - 2025',
      start_date: new Date('2025-12-01'),
      end_date: new Date('2025-12-31'),
      is_active: true,
      description: 'Đợt thi cuối học kỳ 1 năm học 2025-2026',
      location,
    });
    await em.persistAndFlush(examSession);
    console.log('✅ Đã seed ExamSession:', examSession.name);

    // 🔟 StudentCourseRegistration
    const scr = em.create(StudentCourseRegistration, {
      student,
      course,
      examSession,
      is_active: true,
    });
    await em.persistAndFlush(scr);
    console.log('✅ Đã seed StudentCourseRegistration');

    // 11️⃣ Exam Group
    const examGroup = em.create(ExamGroup, {
      code: 'EG001',
      expected_student_count: 50,
      status: 'not_scheduled',
      course,
      examSession,
    });
    await em.persistAndFlush(examGroup);
    console.log('✅ Đã seed ExamGroup:', examGroup.code);

    // 12️⃣ StudentExamGroup
    const seg = em.create(StudentExamGroup, {
      student,
      examGroup,
      is_active: true,
    });
    await em.persistAndFlush(seg);
    console.log('✅ Đã seed StudentExamGroup');

    // 13️⃣ Exam Slot
    const slot = em.create(ExamSlot, {
      slotName: 'Ca 1',
      startTime: '08:00',
      endTime: '10:00',
      description: 'Ca thi buổi sáng',
    });
    await em.persistAndFlush(slot);
    console.log('✅ Đã seed ExamSlot:', slot.slotName);

    // 14️⃣ Exam
    const exam = em.create(Exam, {
      examGroup,
      room,
      examSlot: slot,
      examDate: new Date('2025-12-15'),
      duration: 120,
      status: 'DỰ_THẢO',
    });
    await em.persistAndFlush(exam);
    console.log('✅ Đã seed Exam:', exam.id);

    // 15️⃣ ExamRegistration
    const examReg = em.create(ExamRegistration, {
      exam,
      student,
    });
    await em.persistAndFlush(examReg);
    console.log('✅ Đã seed ExamRegistration');

    // 16️⃣ ExamSupervisor
    const examSup = em.create(ExamSupervisor, {
      exam,
      lecturer,
      role: 'CHINH',
    });
    await em.persistAndFlush(examSup);
    console.log('✅ Đã seed ExamSupervisor');

    console.log('🎉 Seed dữ liệu hoàn tất!');
  }
}
