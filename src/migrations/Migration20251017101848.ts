import { Migration } from '@mikro-orm/migrations';

export class Migration20251017101848 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`exam_slot\` (\`id\` int unsigned not null auto_increment primary key, \`exam_session_id\` int unsigned not null, \`slot_name\` varchar(255) not null, \`start_time\` varchar(255) not null, \`end_time\` varchar(255) not null, \`description\` varchar(255) null, \`created_at\` datetime not null, \`updated_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`exam_slot\` add index \`exam_slot_exam_session_id_index\`(\`exam_session_id\`);`);

    this.addSql(`create table \`exam\` (\`id\` int unsigned not null auto_increment primary key, \`exam_session_id\` int unsigned not null, \`exam_group_id\` int unsigned not null, \`room_id\` int unsigned not null, \`exam_slot_id\` int unsigned not null, \`exam_date\` datetime not null, \`duration\` int not null, \`status\` varchar(255) not null, \`created_at\` datetime not null, \`updated_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`exam\` add index \`exam_exam_session_id_index\`(\`exam_session_id\`);`);
    this.addSql(`alter table \`exam\` add index \`exam_exam_group_id_index\`(\`exam_group_id\`);`);
    this.addSql(`alter table \`exam\` add index \`exam_room_id_index\`(\`room_id\`);`);
    this.addSql(`alter table \`exam\` add index \`exam_exam_slot_id_index\`(\`exam_slot_id\`);`);

    this.addSql(`create table \`exam_registration\` (\`id\` int unsigned not null auto_increment primary key, \`exam_id\` int unsigned not null, \`student_id\` int unsigned not null, \`created_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`exam_registration\` add index \`exam_registration_exam_id_index\`(\`exam_id\`);`);
    this.addSql(`alter table \`exam_registration\` add index \`exam_registration_student_id_index\`(\`student_id\`);`);

    this.addSql(`create table \`exam_supervisor\` (\`id\` int unsigned not null auto_increment primary key, \`exam_id\` int unsigned not null, \`lecturer_id\` int unsigned not null, \`role\` varchar(255) not null, \`created_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`exam_supervisor\` add index \`exam_supervisor_exam_id_index\`(\`exam_id\`);`);
    this.addSql(`alter table \`exam_supervisor\` add index \`exam_supervisor_lecturer_id_index\`(\`lecturer_id\`);`);

    this.addSql(`alter table \`exam_slot\` add constraint \`exam_slot_exam_session_id_foreign\` foreign key (\`exam_session_id\`) references \`exam_sessions\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`exam\` add constraint \`exam_exam_session_id_foreign\` foreign key (\`exam_session_id\`) references \`exam_sessions\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`exam\` add constraint \`exam_exam_group_id_foreign\` foreign key (\`exam_group_id\`) references \`exam_groups\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`exam\` add constraint \`exam_room_id_foreign\` foreign key (\`room_id\`) references \`rooms\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`exam\` add constraint \`exam_exam_slot_id_foreign\` foreign key (\`exam_slot_id\`) references \`exam_slot\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`exam_registration\` add constraint \`exam_registration_exam_id_foreign\` foreign key (\`exam_id\`) references \`exam\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`exam_registration\` add constraint \`exam_registration_student_id_foreign\` foreign key (\`student_id\`) references \`student\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`exam_supervisor\` add constraint \`exam_supervisor_exam_id_foreign\` foreign key (\`exam_id\`) references \`exam\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`exam_supervisor\` add constraint \`exam_supervisor_lecturer_id_foreign\` foreign key (\`lecturer_id\`) references \`lecturer\` (\`id\`) on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`exam\` drop foreign key \`exam_exam_slot_id_foreign\`;`);

    this.addSql(`alter table \`exam_registration\` drop foreign key \`exam_registration_exam_id_foreign\`;`);

    this.addSql(`alter table \`exam_supervisor\` drop foreign key \`exam_supervisor_exam_id_foreign\`;`);

    this.addSql(`drop table if exists \`exam_slot\`;`);

    this.addSql(`drop table if exists \`exam\`;`);

    this.addSql(`drop table if exists \`exam_registration\`;`);

    this.addSql(`drop table if exists \`exam_supervisor\`;`);
  }

}
