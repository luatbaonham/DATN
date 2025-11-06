import { Migration } from '@mikro-orm/migrations';

export class Migration20251103180256 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table \`course\` add \`duration_course_exam\` int not null default 90;`,
    );

    this.addSql(
      `alter table \`exam_groups\` add \`is_active\` tinyint(1) not null default true;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`course\` drop column \`duration_course_exam\`;`);

    this.addSql(`alter table \`exam_groups\` drop column \`is_active\`;`);
  }
}
