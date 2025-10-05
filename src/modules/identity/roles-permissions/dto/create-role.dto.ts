import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'ADMIN', description: 'Tên role' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Quản trị hệ thống', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
