// class.module.ts
import { Module } from '@nestjs/common';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Classes } from './entities/class.entity';
import { Department } from '../departments/entities/department.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Classes, Department])],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService],
})
export class ClassModule {}
