import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Course } from './entities/course.entity';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';

@Module({
  imports: [MikroOrmModule.forFeature([Course])],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [],
})
export class CourseModule {}
