import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Student } from './entities/student.entity';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';

@Module({
  imports: [MikroOrmModule.forFeature([Student])],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [],
})
export class StudentModule {}
