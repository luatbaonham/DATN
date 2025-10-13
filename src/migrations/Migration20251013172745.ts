import { Migration } from '@mikro-orm/migrations';

export class Migration20251013172745 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`constraint\` (\`id\` int unsigned not null auto_increment primary key, \`constraint_code\` varchar(255) not null, \`description\` varchar(255) not null, \`type\` varchar(255) not null, \`scope\` varchar(255) not null) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`constraint_rule\` (\`id\` int unsigned not null auto_increment primary key, \`exam_session_id\` int unsigned null, \`constraint_id\` int unsigned not null, \`is_active\` tinyint(1) not null, \`rule\` json not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`constraint_rule\` add index \`constraint_rule_exam_session_id_index\`(\`exam_session_id\`);`);
    this.addSql(`alter table \`constraint_rule\` add index \`constraint_rule_constraint_id_index\`(\`constraint_id\`);`);

    this.addSql(`alter table \`constraint_rule\` add constraint \`constraint_rule_exam_session_id_foreign\` foreign key (\`exam_session_id\`) references \`exam_sessions\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`constraint_rule\` add constraint \`constraint_rule_constraint_id_foreign\` foreign key (\`constraint_id\`) references \`constraint\` (\`id\`) on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`constraint_rule\` drop foreign key \`constraint_rule_constraint_id_foreign\`;`);

    this.addSql(`drop table if exists \`constraint\`;`);

    this.addSql(`drop table if exists \`constraint_rule\`;`);
  }

}
