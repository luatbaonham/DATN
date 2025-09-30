// update-supervisor.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateSupervisorDto {
  @IsOptional()
  @ApiProperty({ example: 'GT001', description: 'Mã giám thị' })
  @IsString({ message: 'Mã giám thị phải là chuỗi' })
  code?: string;

  @IsOptional()
  @ApiProperty({ example: 1, description: 'ID giảng viên' })
  @IsNumber({}, { message: 'ID giảng viên phải là số' })
  lecturerId?: number;
}
