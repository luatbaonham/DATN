import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

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
  @IsString()
  @IsNotEmpty()
  departmentName!: string;

  @ApiProperty({
    description: 'ID địa điểm tổ chức thi',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  location_id!: number;
}
