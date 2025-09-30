import { Module } from '@nestjs/common';
import { DepartmentController } from './departments.controller';
import { DepartmentService } from './departments.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Department } from './entities/department.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Department])],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [],
})
export class DepartmentModule {}
