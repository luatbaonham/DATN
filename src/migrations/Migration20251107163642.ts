import { Migration } from '@mikro-orm/migrations';

export class Migration20251107163642 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`exam_groups\` drop column \`code\`;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`exam_groups\` add \`code\` varchar(255) not null;`);
  }

}
