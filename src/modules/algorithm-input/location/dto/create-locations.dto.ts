import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({
    description: 'Mã cơ sở (duy nhất)',
    example: 'CS001',
  })
  @IsNotEmpty({ message: 'Mã cơ sở không được để trống' })
  code!: string;

  @ApiProperty({
    description: 'Tên cơ sở',
    example: 'Cơ sở Man Thiện',
  })
  @IsNotEmpty({ message: 'Tên cơ sở không được để trống' })
  name!: string;

  @ApiProperty({
    description: 'Địa chỉ cơ sở',
    example: '97 Man Thiện',
  })
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  address!: string;
}
