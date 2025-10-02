import { Migration } from '@mikro-orm/migrations';

export class Migration20250930160601 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`department\` (\`id\` int unsigned not null auto_increment primary key, \`department_name\` varchar(255) not null, \`department_code\` varchar(255) not null, \`create_at\` datetime not null, \`update_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`classes\` (\`id\` int unsigned not null auto_increment primary key, \`class_name\` varchar(255) not null, \`class_code\` varchar(255) not null, \`department_id\` int unsigned not null, \`create_at\` datetime not null, \`update_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`classes\` add index \`classes_department_id_index\`(\`department_id\`);`);

    this.addSql(`create table \`permission\` (\`id\` int unsigned not null auto_increment primary key, \`action\` varchar(255) not null, \`resource\` varchar(255) not null, \`description\` varchar(255) null, \`create_at\` datetime not null, \`update_at\` datetime not null, \`conditions\` json null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`permission\` add index \`permission_action_index\`(\`action\`);`);
    this.addSql(`alter table \`permission\` add index \`permission_resource_index\`(\`resource\`);`);

    this.addSql(`create table \`role\` (\`id\` int unsigned not null auto_increment primary key, \`name\` varchar(255) not null, \`description\` varchar(255) not null, \`create_at\` datetime not null, \`update_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`role_permission\` (\`role_id\` int unsigned not null, \`permission_id\` int unsigned not null, primary key (\`role_id\`, \`permission_id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`role_permission\` add index \`role_permission_role_id_index\`(\`role_id\`);`);
    this.addSql(`alter table \`role_permission\` add index \`role_permission_permission_id_index\`(\`permission_id\`);`);

    this.addSql(`create table \`user\` (\`id\` int unsigned not null auto_increment primary key, \`first_name\` varchar(255) not null, \`last_name\` varchar(255) not null, \`email\` varchar(255) not null, \`password\` varchar(255) not null, \`create_at\` datetime not null, \`update_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`student\` (\`id\` int unsigned not null auto_increment primary key, \`student_code\` varchar(255) not null, \`date_of_birth\` datetime not null, \`gender\` varchar(255) not null, \`address\` varchar(255) not null, \`phone_number\` varchar(255) not null, \`user_id\` int unsigned null, \`class_id\` int unsigned null, \`create_at\` datetime not null, \`update_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`student\` add unique \`student_student_code_unique\`(\`student_code\`);`);
    this.addSql(`alter table \`student\` add unique \`student_user_id_unique\`(\`user_id\`);`);
    this.addSql(`alter table \`student\` add index \`student_class_id_index\`(\`class_id\`);`);

    this.addSql(`create table \`refresh_token\` (\`id\` int unsigned not null auto_increment primary key, \`user_id\` int unsigned not null, \`token\` varchar(255) not null, \`expires_at\` datetime not null, \`device_info\` varchar(255) not null, \`ip_address\` varchar(255) null, \`user_agent\` varchar(255) null, \`created_at\` datetime not null, \`last_used_at\` datetime null, \`revoked_at\` datetime null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`refresh_token\` add index \`refresh_token_user_id_index\`(\`user_id\`);`);

    this.addSql(`create table \`lecturer\` (\`id\` int unsigned not null auto_increment primary key, \`lecturer_code\` varchar(255) not null, \`user_id\` int unsigned not null, \`department_id\` int unsigned not null, \`created_at\` datetime not null, \`updated_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`lecturer\` add unique \`lecturer_lecturer_code_unique\`(\`lecturer_code\`);`);
    this.addSql(`alter table \`lecturer\` add unique \`lecturer_user_id_unique\`(\`user_id\`);`);
    this.addSql(`alter table \`lecturer\` add index \`lecturer_department_id_index\`(\`department_id\`);`);

    this.addSql(`create table \`supervisor\` (\`id\` int unsigned not null auto_increment primary key, \`code\` varchar(255) not null, \`lecturer_id\` int unsigned not null, \`created_at\` datetime not null, \`updated_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`supervisor\` add unique \`supervisor_code_unique\`(\`code\`);`);
    this.addSql(`alter table \`supervisor\` add unique \`supervisor_lecturer_id_unique\`(\`lecturer_id\`);`);

    this.addSql(`create table \`user_role\` (\`user_id\` int unsigned not null, \`role_id\` int unsigned not null, primary key (\`user_id\`, \`role_id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`user_role\` add index \`user_role_user_id_index\`(\`user_id\`);`);
    this.addSql(`alter table \`user_role\` add index \`user_role_role_id_index\`(\`role_id\`);`);

    this.addSql(`alter table \`classes\` add constraint \`classes_department_id_foreign\` foreign key (\`department_id\`) references \`department\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`role_permission\` add constraint \`role_permission_role_id_foreign\` foreign key (\`role_id\`) references \`role\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`role_permission\` add constraint \`role_permission_permission_id_foreign\` foreign key (\`permission_id\`) references \`permission\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`student\` add constraint \`student_user_id_foreign\` foreign key (\`user_id\`) references \`user\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`student\` add constraint \`student_class_id_foreign\` foreign key (\`class_id\`) references \`classes\` (\`id\`) on update cascade on delete set null;`);

    this.addSql(`alter table \`refresh_token\` add constraint \`refresh_token_user_id_foreign\` foreign key (\`user_id\`) references \`user\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`lecturer\` add constraint \`lecturer_user_id_foreign\` foreign key (\`user_id\`) references \`user\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`lecturer\` add constraint \`lecturer_department_id_foreign\` foreign key (\`department_id\`) references \`department\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`supervisor\` add constraint \`supervisor_lecturer_id_foreign\` foreign key (\`lecturer_id\`) references \`lecturer\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`user_role\` add constraint \`user_role_user_id_foreign\` foreign key (\`user_id\`) references \`user\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`user_role\` add constraint \`user_role_role_id_foreign\` foreign key (\`role_id\`) references \`role\` (\`id\`) on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`classes\` drop foreign key \`classes_department_id_foreign\`;`);

    this.addSql(`alter table \`lecturer\` drop foreign key \`lecturer_department_id_foreign\`;`);

    this.addSql(`alter table \`student\` drop foreign key \`student_class_id_foreign\`;`);

    this.addSql(`alter table \`role_permission\` drop foreign key \`role_permission_permission_id_foreign\`;`);

    this.addSql(`alter table \`role_permission\` drop foreign key \`role_permission_role_id_foreign\`;`);

    this.addSql(`alter table \`user_role\` drop foreign key \`user_role_role_id_foreign\`;`);

    this.addSql(`alter table \`student\` drop foreign key \`student_user_id_foreign\`;`);

    this.addSql(`alter table \`refresh_token\` drop foreign key \`refresh_token_user_id_foreign\`;`);

    this.addSql(`alter table \`lecturer\` drop foreign key \`lecturer_user_id_foreign\`;`);

    this.addSql(`alter table \`user_role\` drop foreign key \`user_role_user_id_foreign\`;`);

    this.addSql(`alter table \`supervisor\` drop foreign key \`supervisor_lecturer_id_foreign\`;`);

    this.addSql(`drop table if exists \`department\`;`);

    this.addSql(`drop table if exists \`classes\`;`);

    this.addSql(`drop table if exists \`permission\`;`);

    this.addSql(`drop table if exists \`role\`;`);

    this.addSql(`drop table if exists \`role_permission\`;`);

    this.addSql(`drop table if exists \`user\`;`);

    this.addSql(`drop table if exists \`student\`;`);

    this.addSql(`drop table if exists \`refresh_token\`;`);

    this.addSql(`drop table if exists \`lecturer\`;`);

    this.addSql(`drop table if exists \`supervisor\`;`);

    this.addSql(`drop table if exists \`user_role\`;`);
  }

}
