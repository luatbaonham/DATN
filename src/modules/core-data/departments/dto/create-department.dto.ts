import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Mã khoa',
    example: 'CNTT',
  })
  @IsString()
  @IsNotEmpty()
  departmentCode!: string;

  @ApiProperty({
    description: 'Tên khoa',
    example: 'Công Nghệ Thông Tin',
  })
  departmentName!: string;
}
