import { Module } from '@nestjs/common';
import { CourseDepartmentService } from './course-department.service';
import { CourseDepartmentController } from './course-department.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CourseDepartment } from './entities/course-department.entity';

@Module({
  imports: [MikroOrmModule.forFeature([CourseDepartment])],
  controllers: [CourseDepartmentController],
  providers: [CourseDepartmentService],
})
export class CourseDepartmentModule {}
