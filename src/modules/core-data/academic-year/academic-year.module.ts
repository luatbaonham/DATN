import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AcademicYear } from './entities/academic-year.entity';
import { AcademicYearService } from './academic-year.service';
import { AcademicYearController } from './academic-year.controller';

@Module({
  imports: [MikroOrmModule.forFeature([AcademicYear])],
  controllers: [AcademicYearController],
  providers: [AcademicYearService],
  //   exports: [AcademicYearService],
})
export class AcademicYearModule {}
