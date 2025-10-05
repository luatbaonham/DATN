import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({
    description: 'Danh sách roleId cần gán cho user',
    example: [1, 2],
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  roleIds!: number[];
}
