import { Expose, Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude() // ẩn toàn bộ field mặc định
export class RegisterResponseDto {
  @ApiProperty({
    description: 'ID của user mới',
    example: 1,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Họ của người dùng',
    example: 'Nguyễn Đình',
  })
  @Expose()
  firstName!: string;

  @ApiProperty({
    description: 'Tên của người dùng',
    example: 'Luật',
  })
  @Expose()
  lastName!: string;

  @ApiProperty({
    description: 'Email của người dùng',
    example: 'luatnguyen@example.com',
  })
  @Expose()
  email!: string;
}
