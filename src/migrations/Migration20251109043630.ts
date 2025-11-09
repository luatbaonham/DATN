import { Migration } from '@mikro-orm/migrations';

export class Migration20251109043630 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`schedule_config\` (\`id\` int unsigned not null auto_increment primary key, \`exam_session_id\` int unsigned not null, \`start_date\` varchar(255) not null, \`end_date\` varchar(255) not null, \`rooms\` json not null, \`lecturers\` json not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`schedule_config\` add index \`schedule_config_exam_session_id_index\`(\`exam_session_id\`);`);

    this.addSql(`alter table \`schedule_config\` add constraint \`schedule_config_exam_session_id_foreign\` foreign key (\`exam_session_id\`) references \`exam_sessions\` (\`id\`) on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`schedule_config\`;`);
  }

}
