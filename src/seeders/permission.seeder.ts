import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Permission } from '@modules/roles-permissions/entities/permission.entity';
import { RolePermission } from '@modules/roles-permissions/entities/role-permission.entity';
import { Role } from '@modules/roles-permissions/entities/role.entity';

export class PermissionSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Danh sách permissions từ role.docx
    const permissions = [
      {
        action: 'manage_users',
        resource: 'users',
        description: 'Quản lý tài khoản người dùng',
        roles: ['ADMIN', 'GIAO_VU'],
      },
      {
        action: 'manage_roles',
        resource: 'roles',
        description: 'Gán vai trò cho người dùng',
        roles: ['ADMIN'],
      },
      {
        action: 'manage_departments',
        resource: 'departments',
        description: 'Quản lý khoa/bộ môn',
        roles: ['ADMIN', 'GIAO_VU'],
      },
      {
        action: 'manage_subjects',
        resource: 'subjects',
        description: 'Quản lý môn học',
        roles: ['ADMIN', 'GIAO_VU'],
      },
      {
        action: 'manage_classes',
        resource: 'classes',
        description: 'Quản lý lớp',
        roles: ['ADMIN', 'GIAO_VU'],
      },
      {
        action: 'import_students',
        resource: 'students',
        description: 'Import danh sách sinh viên',
        roles: ['ADMIN', 'GIAO_VU'],
      },
      {
        action: 'manage_rooms',
        resource: 'rooms',
        description: 'Quản lý phòng thi',
        roles: ['ADMIN'],
      },
      {
        action: 'import_lecturers',
        resource: 'lecturers',
        description: 'Import danh sách giảng viên',
        roles: ['ADMIN'],
      },
      {
        action: 'manage_exam_sessions',
        resource: 'exam_sessions',
        description: 'Quản lý đợt thi',
        roles: ['ADMIN'],
      },
      {
        action: 'import_exam_registration',
        resource: 'exam_registration',
        description: 'Import danh sách sinh viên đăng ký thi',
        roles: ['ADMIN', 'GIAO_VU'],
      },
      {
        action: 'create_exam_group',
        resource: 'exam_groups',
        description: 'Tạo/gộp/tách nhóm thi',
        roles: ['ADMIN'],
      },
      {
        action: 'set_constraints',
        resource: 'constraints',
        description: 'Thiết lập ràng buộc cứng/mềm',
        roles: ['ADMIN'],
      },
      {
        action: 'run_auto_schedule',
        resource: 'schedules',
        description: 'Chạy thuật toán xếp lịch tự động',
        roles: ['ADMIN'],
      },
      {
        action: 'manual_edit_schedule',
        resource: 'schedules',
        description: 'Chỉnh sửa lịch thủ công',
        roles: ['ADMIN'],
      },
      {
        action: 'view_schedule',
        resource: 'schedules',
        description: 'Xem lịch thi/lịch coi thi',
        roles: ['ADMIN', 'GIANG_VIEN', 'GIAM_THI', 'SINH_VIEN'],
      },
      {
        action: 'view_conflicts',
        resource: 'schedules',
        description: 'Xem nhóm thi không xếp được + lý do',
        roles: ['ADMIN'],
      },
      {
        action: 'assign_proctors',
        resource: 'proctors',
        description: 'Phân công giám thị',
        roles: ['ADMIN'],
      },
      {
        action: 'auto_assign_proctors',
        resource: 'proctors',
        description: 'Tự động gợi ý giám thị',
        roles: ['ADMIN'],
      },
      {
        action: 'publish_schedule',
        resource: 'schedules',
        description: 'Chốt & công bố lịch thi',
        roles: ['ADMIN'],
      },
      {
        action: 'export_exam_list',
        resource: 'exam_list',
        description: 'Xuất danh sách thi theo phòng',
        roles: ['ADMIN', 'GIANG_VIEN', 'GIAM_THI'],
      },
      {
        action: 'export_schedule',
        resource: 'schedules',
        description: 'Xuất lịch thi tổng hợp',
        roles: ['ADMIN'],
      },
      {
        action: 'export_proctor_schedule',
        resource: 'proctors',
        description: 'Xuất lịch coi thi cho giám thị',
        roles: ['ADMIN'],
      },
      {
        action: 'enter_grades',
        resource: 'grades',
        description: 'Nhập điểm thi',
        roles: ['ADMIN', 'GIANG_VIEN'],
        condition: { lecturer: true },
      },
      {
        action: 'import_grades',
        resource: 'grades',
        description: 'Import điểm từ file Excel',
        roles: ['ADMIN'],
      },
      {
        action: 'view_grades',
        resource: 'grades',
        description: 'Xem điểm thi (sinh viên)',
        roles: ['SINH_VIEN'],
        condition: { student: true },
      },
      {
        action: 'view_personal_schedule',
        resource: 'schedules',
        description: 'Xem lịch cá nhân',
        roles: ['GIANG_VIEN', 'GIAM_THI', 'SINH_VIEN'],
      },
      {
        action: 'view_subject_schedule',
        resource: 'schedules',
        description: 'Tra cứu lịch theo môn học',
        roles: ['SINH_VIEN'],
      },
      {
        action: 'download_student_list',
        resource: 'students',
        description: 'Tải danh sách sinh viên phòng thi',
        roles: ['GIANG_VIEN', 'GIAM_THI'],
      },
      {
        action: 'register_availability',
        resource: 'availability',
        description: 'Đăng ký lịch rảnh',
        roles: ['GIANG_VIEN'],
      },
      {
        action: 'receive_notifications',
        resource: 'notifications',
        description: 'Nhận thông báo thay đổi lịch/điểm',
        roles: ['GIANG_VIEN', 'GIAM_THI', 'SINH_VIEN'],
      },
      {
        action: 'search_filter',
        resource: 'system',
        description: 'Tìm kiếm & lọc lịch thi, sinh viên, phòng thi',
        roles: ['ADMIN', 'GIAO_VU', 'GIANG_VIEN', 'GIAM_THI', 'SINH_VIEN'],
      },
      {
        action: 'send_notifications',
        resource: 'notifications',
        description: 'Gửi thông báo email/app',
        roles: ['ADMIN'],
      },
      {
        action: 'view_reports',
        resource: 'reports',
        description: 'Thống kê sử dụng phòng, số buổi coi thi, phổ điểm',
        roles: ['ADMIN'],
      },
      {
        action: 'audit_log',
        resource: 'logs',
        description: 'Xem nhật ký hệ thống',
        roles: ['ADMIN'],
      },
    ];

    // Tạo hoặc lấy roles trước
    const roles = {};
    const roleNames = [
      'ADMIN',
      'GIAO_VU',
      'GIANG_VIEN',
      'GIAM_THI',
      'SINH_VIEN',
    ];
    for (const name of roleNames) {
      let role = await em.findOne('Role', { name });
      if (!role) {
        role = em.create(Role, { name, description: `Role ${name}` });
        await em.persistAndFlush(role);
      }
      roles[name] = role;
    }
    // Tạo permissions và gán vào roles
    for (const perm of permissions) {
      let permission = await em.findOne(Permission, {
        action: perm.action,
        resource: perm.resource,
      });
      if (!permission) {
        permission = em.create(Permission, {
          action: perm.action,
          resource: perm.resource,
          description: perm.description,
          conditions: perm.condition || null,
        });
        await em.persistAndFlush(permission);
      }
      // Gán permission vào các roles tương ứng
      for (const roleName of perm.roles) {
        const role = roles[roleName];
        const rolePerm = await em.findOne(RolePermission, { role, permission });
        if (!rolePerm) {
          em.create(RolePermission, { role, permission });
        }
      }
    }
    await em.flush();
  }
} // phải xem lại chỗ tạo role, nếu chạy seeder nhiều lần sẽ bị duplicate, với permission thì không sao vì có check tồn tại, và cả RolePermission cũng vậy, với điều kiện là mỗi role chỉ được gán 1 lần cho mỗi permission, với chưa hiểu code lắm kkk
