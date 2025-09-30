import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RoleDto {
  @Expose()
  @ApiProperty({ example: 1, description: 'ID của role' })
  id!: number;

  @Expose()
  @ApiProperty({ example: 'ADMIN', description: 'Tên role' })
  name!: string;

  @Expose()
  @ApiProperty({ example: 'Quản trị hệ thống', description: 'Mô tả role' })
  description?: string;
}
