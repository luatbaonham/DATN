import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Họ của người dùng',
    example: 'Nguyễn Đình',
  })
  
  @IsString({ message: 'Họ phải là chuỗi' })
  @IsNotEmpty({ message: 'Họ không được để trống' })
  firstName!: string;

  @ApiProperty({
    description: 'Tên của người dùng',
    example: 'Luật',
  })
  
  @IsString({ message: 'Tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  lastName!: string;

  @ApiProperty({
    description: 'Địa chỉ email duy nhất của người dùng',
    example: 'luatnguyen@example.com',
    format: 'email',
  })
  
  @IsEmail({}, { message: 'Email sai định dạng (example@gmail.com)' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email!: string;

  @ApiProperty({
    description: 'Mật khẩu tài khoản (ít nhất 6 ký tự)',
    example: 'SecurePass123',
    minLength: 6,
  })
  
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu ít nhất 6 ký tự' })
  password!: string;
}
