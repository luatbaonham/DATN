import { RoleDto } from '@modules/identity/roles-permissions/dto/roles-res.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';

@Exclude() // ẩn toàn bộ field mặc định
export class UserResponseDto {
  @ApiProperty({ example: 1, description: 'ID người dùng' })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'Nguyễn Đình', description: 'Họ của người dùng' })
  @Expose()
  firstName!: string;

  @ApiProperty({ example: 'Luật', description: 'Tên của người dùng' })
  @Expose()
  lastName!: string;

  @ApiProperty({
    example: 'luat@gmail.com',
    description: 'Email của người dùng',
  })
  @Expose()
  email!: string;

  @Expose()
  @ApiProperty({
    example: [{ id: 1, name: 'Admin', description: 'Role Admin' }],
    description: 'Danh sách role của người dùng',
    type: [RoleDto], // tạo thêm RoleDto nếu cần
  })
  roles!: RoleDto[];

  @ApiProperty({
    example: '2023-10-10T10:00:00Z',
    description: 'Thời gian tạo người dùng',
  })
  @Expose()
  createAt?: Date;

  @ApiProperty({
    example: '2023-10-11T10:00:00Z',
    description: 'Thời gian cập nhật người dùng gần nhất',
  })
  @Expose()
  updateAt?: Date;
}
