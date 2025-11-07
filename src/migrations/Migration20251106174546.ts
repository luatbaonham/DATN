import { Migration } from '@mikro-orm/migrations';

export class Migration20251106174546 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`exam_groups\` drop column \`is_active\`;`);

    this.addSql(`alter table \`lecturer\` drop column \`is_supervisor\`;`);

    this.addSql(`alter table \`exam_supervisor\` drop column \`role\`;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`exam_groups\` add \`is_active\` tinyint(1) not null default true;`);

    this.addSql(`alter table \`lecturer\` add \`is_supervisor\` tinyint(1) not null default false;`);

    this.addSql(`alter table \`exam_supervisor\` add \`role\` varchar(255) not null;`);
  }

}
