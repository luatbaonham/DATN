// update-class.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateClassDto {
  @IsOptional()
  @ApiProperty({ example: 'Lớp 20CLC', description: 'Tên lớp học' })
  @IsString({ message: 'Tên lớp phải là chuỗi' })
  name?: string;

  @IsOptional()
  @ApiProperty({ example: '20CLC', description: 'Mã lớp học' })
  @IsString({ message: 'Mã lớp phải là chuỗi' })
  code?: string;

  @IsOptional()
  @ApiProperty({ example: 1, description: 'ID khoa' })
  @IsNumber({}, { message: 'ID khoa phải là số' })
  departmentId?: number;
}
