import { Migration } from '@mikro-orm/migrations';

export class Migration20251114153718 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`student_course_registrations\` drop foreign key \`student_course_registrations_exam_session_id_foreign\`;`);

    this.addSql(`alter table \`student_course_registrations\` drop index \`student_course_registrations_exam_session_id_index\`;`);
    this.addSql(`alter table \`student_course_registrations\` drop column \`exam_session_id\`;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`student_course_registrations\` add \`exam_session_id\` int unsigned not null;`);
    this.addSql(`alter table \`student_course_registrations\` add constraint \`student_course_registrations_exam_session_id_foreign\` foreign key (\`exam_session_id\`) references \`exam_sessions\` (\`id\`) on update cascade on delete no action;`);
    this.addSql(`alter table \`student_course_registrations\` add index \`student_course_registrations_exam_session_id_index\`(\`exam_session_id\`);`);
  }

}
