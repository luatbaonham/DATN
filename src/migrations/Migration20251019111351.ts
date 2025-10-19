import { Migration } from '@mikro-orm/migrations';

export class Migration20251019111351 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`exam\` drop foreign key \`exam_exam_session_id_foreign\`;`);

    this.addSql(`alter table \`exam\` drop index \`exam_exam_session_id_index\`;`);
    this.addSql(`alter table \`exam\` drop column \`exam_session_id\`;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`exam\` add \`exam_session_id\` int unsigned not null;`);
    this.addSql(`alter table \`exam\` add constraint \`exam_exam_session_id_foreign\` foreign key (\`exam_session_id\`) references \`exam_sessions\` (\`id\`) on update cascade on delete no action;`);
    this.addSql(`alter table \`exam\` add index \`exam_exam_session_id_index\`(\`exam_session_id\`);`);
  }

}
