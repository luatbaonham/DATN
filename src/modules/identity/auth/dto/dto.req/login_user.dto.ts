import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Địa chỉ email của người dùng',
    example: 'luatnguyen@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Email sai định dạng (example@gmail.com)' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email!: string;

  @ApiProperty({
    description: 'Mật khẩu của người dùng',
    example: 'SecurePass123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password!: string;
}
