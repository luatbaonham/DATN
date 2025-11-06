import { Migration } from '@mikro-orm/migrations';

export class Migration20251104183853 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`exam_groups\` drop index \`exam_groups_code_unique\`;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`exam_groups\` add unique \`exam_groups_code_unique\`(\`code\`);`);
  }

}
