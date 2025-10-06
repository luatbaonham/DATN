import { Migration } from '@mikro-orm/migrations';

export class Migration20251005103538 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`rooms\` (\`id\` int unsigned not null auto_increment primary key, \`code\` varchar(255) not null, \`capacity\` int not null, \`type\` varchar(255) not null, \`is_active\` tinyint(1) not null default true, \`location_id\` int unsigned not null, \`create_at\` datetime not null, \`update_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`rooms\` add unique \`rooms_code_unique\`(\`code\`);`);
    this.addSql(`alter table \`rooms\` add index \`rooms_location_id_index\`(\`location_id\`);`);

    this.addSql(`create table \`student_exam_groups\` (\`id\` int unsigned not null auto_increment primary key, \`student_id\` int unsigned not null, \`exam_group_id\` int unsigned not null, \`is_active\` tinyint(1) not null default true) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`student_exam_groups\` add index \`student_exam_groups_student_id_index\`(\`student_id\`);`);
    this.addSql(`alter table \`student_exam_groups\` add index \`student_exam_groups_exam_group_id_index\`(\`exam_group_id\`);`);

    this.addSql(`create table \`student_course_registrations\` (\`id\` int unsigned not null auto_increment primary key, \`student_id\` int unsigned not null, \`course_id\` int unsigned not null, \`exam_session_id\` int unsigned not null, \`is_active\` tinyint(1) not null default true, \`create_at\` datetime not null, \`update_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`student_course_registrations\` add index \`student_course_registrations_student_id_index\`(\`student_id\`);`);
    this.addSql(`alter table \`student_course_registrations\` add index \`student_course_registrations_course_id_index\`(\`course_id\`);`);
    this.addSql(`alter table \`student_course_registrations\` add index \`student_course_registrations_exam_session_id_index\`(\`exam_session_id\`);`);

    this.addSql(`alter table \`rooms\` add constraint \`rooms_location_id_foreign\` foreign key (\`location_id\`) references \`locations\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`student_exam_groups\` add constraint \`student_exam_groups_student_id_foreign\` foreign key (\`student_id\`) references \`student\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`student_exam_groups\` add constraint \`student_exam_groups_exam_group_id_foreign\` foreign key (\`exam_group_id\`) references \`exam_groups\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`student_course_registrations\` add constraint \`student_course_registrations_student_id_foreign\` foreign key (\`student_id\`) references \`student\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`student_course_registrations\` add constraint \`student_course_registrations_course_id_foreign\` foreign key (\`course_id\`) references \`course\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`student_course_registrations\` add constraint \`student_course_registrations_exam_session_id_foreign\` foreign key (\`exam_session_id\`) references \`exam_sessions\` (\`id\`) on update cascade;`);

    this.addSql(`drop table if exists \`supervisor\`;`);

    this.addSql(`alter table \`lecturer\` drop foreign key \`lecturer_department_id_foreign\`;`);
    this.addSql(`alter table \`lecturer\` drop foreign key \`lecturer_user_id_foreign\`;`);

    this.addSql(`alter table \`exam_sessions\` add constraint \`exam_sessions_location_id_foreign\` foreign key (\`location_id\`) references \`locations\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`exam_groups\` add constraint \`exam_groups_course_id_foreign\` foreign key (\`course_id\`) references \`course\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`exam_groups\` add constraint \`exam_groups_exam_session_id_foreign\` foreign key (\`exam_session_id\`) references \`exam_sessions\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`department\` add \`location_id\` int unsigned not null;`);
    this.addSql(`alter table \`department\` add constraint \`department_location_id_foreign\` foreign key (\`location_id\`) references \`locations\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`department\` add index \`department_location_id_index\`(\`location_id\`);`);

    this.addSql(`alter table \`user\` add \`location_id\` int unsigned null;`);
    this.addSql(`alter table \`user\` add constraint \`user_location_id_foreign\` foreign key (\`location_id\`) references \`locations\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`user\` add index \`user_location_id_index\`(\`location_id\`);`);

    this.addSql(`alter table \`lecturer\` add \`is_supervisor\` tinyint(1) not null default false;`);
    this.addSql(`alter table \`lecturer\` modify \`user_id\` int unsigned null, modify \`department_id\` int unsigned null;`);
    this.addSql(`alter table \`lecturer\` add constraint \`lecturer_department_id_foreign\` foreign key (\`department_id\`) references \`department\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`lecturer\` add constraint \`lecturer_user_id_foreign\` foreign key (\`user_id\`) references \`user\` (\`id\`) on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table \`supervisor\` (\`id\` int unsigned not null auto_increment primary key, \`code\` varchar(255) not null, \`lecturer_id\` int unsigned not null, \`created_at\` datetime not null, \`updated_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`supervisor\` add unique \`supervisor_code_unique\`(\`code\`);`);
    this.addSql(`alter table \`supervisor\` add unique \`supervisor_lecturer_id_unique\`(\`lecturer_id\`);`);

    this.addSql(`drop table if exists \`rooms\`;`);

    this.addSql(`drop table if exists \`student_exam_groups\`;`);

    this.addSql(`drop table if exists \`student_course_registrations\`;`);

    this.addSql(`alter table \`department\` drop foreign key \`department_location_id_foreign\`;`);

    this.addSql(`alter table \`exam_groups\` drop foreign key \`exam_groups_course_id_foreign\`;`);
    this.addSql(`alter table \`exam_groups\` drop foreign key \`exam_groups_exam_session_id_foreign\`;`);

    this.addSql(`alter table \`exam_sessions\` drop foreign key \`exam_sessions_location_id_foreign\`;`);

    this.addSql(`alter table \`lecturer\` drop foreign key \`lecturer_user_id_foreign\`;`);
    this.addSql(`alter table \`lecturer\` drop foreign key \`lecturer_department_id_foreign\`;`);

    this.addSql(`alter table \`user\` drop foreign key \`user_location_id_foreign\`;`);

    this.addSql(`alter table \`department\` drop index \`department_location_id_index\`;`);
    this.addSql(`alter table \`department\` drop column \`location_id\`;`);

    this.addSql(`alter table \`lecturer\` drop column \`is_supervisor\`;`);

    this.addSql(`alter table \`lecturer\` modify \`user_id\` int unsigned not null, modify \`department_id\` int unsigned not null;`);

    this.addSql(`alter table \`user\` drop index \`user_location_id_index\`;`);
    this.addSql(`alter table \`user\` drop column \`location_id\`;`);
  }

}
