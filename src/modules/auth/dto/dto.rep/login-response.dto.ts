import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';

@Exclude() // ẩn toàn bộ field mặc định
export class LoginResponseDto {
  @ApiProperty({
    description: 'Access token JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  accessToken!: string;

  @ApiProperty({
    description: 'Refresh token dùng để lấy access token mới',
    example: 'dXNlcjE6cmVmcmVzaHRva2VuMTIz',
  })
  @Expose()
  refreshToken!: string;

  @ApiProperty({
    description: 'Thông tin profile của user',
    type: Object,
    example: {
      id: 1,
      firstName: 'Nguyễn Đình',
      lastName: 'Luật',
      email: 'luatnguyen@example.com',
      roles: ['admin', 'user'],
    },
  })
  @Expose()
  profile!: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
  };
}
