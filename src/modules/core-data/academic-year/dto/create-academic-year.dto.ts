import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateAcademicYearDto {
  @ApiProperty({
    description: 'Tên niên khóa',
    example: '2025-2026',
  })
  @IsString({ message: 'Tên niên khóa phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên niên khóa không được để trống' })
  name!: string;

  @ApiProperty({ description: 'Ngày bắt đầu', example: '2025-06-01T08:00:00Z' })
  @IsDateString()
  startDate!: Date;

  @ApiProperty({
    description: 'Ngày kết thúc',
    example: '2025-06-15T17:00:00Z',
  })
  @IsDateString()
  endDate!: Date;
}
