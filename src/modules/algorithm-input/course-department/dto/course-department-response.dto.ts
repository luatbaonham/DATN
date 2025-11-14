import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CourseDepartmentResponseDto {
  @Expose()
  @ApiProperty()
  id!: number;

  @Expose()
  @ApiProperty()
  courseName!: string;

  @Expose()
  @ApiProperty()
  departmentName!: string;

  @Expose()
  @ApiProperty()
  examSessionName!: string;

  @Expose()
  @ApiProperty()
  isCompulsory!: boolean;

  @Expose()
  @ApiProperty()
  isActive!: boolean;

  @Expose()
  @ApiProperty()
  createdAt!: Date;
}
