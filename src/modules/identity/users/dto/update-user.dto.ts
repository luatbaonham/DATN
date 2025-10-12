import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  // @IsOptional()
  // @ApiProperty({example: 'Nguyễn Đình', description: 'Họ của người dùng'})
  // @IsString({ message: "firstname phải là chuỗi" })
  // firstName?: string;

  // @IsOptional()
  // @ApiProperty({example: 'Luật', description: 'Tên của người dùng'})
  // @IsString({ message: "lastname phải là chuỗi" })
  // lastName?: string;

  @IsOptional()
  @ApiProperty({
    example: 'luat@gmail.com',
    description: 'Email của người dùng',
  })
  @IsEmail({}, { message: 'Email sai định dạng (example@gmail.com)' })
  email?: string;
}
