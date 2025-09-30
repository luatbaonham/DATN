// create-class.dto.ts
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassDto {
  @ApiProperty({
    description: 'Tên lớp học',
    example: 'Lớp Công Nghệ 2',
  })
  @IsString({ message: 'Tên lớp phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên lớp không được để trống' })
  name!: string;

  @ApiProperty({
    description: 'Mã lớp học',
    example: 'D21CQCN02-N',
  })
  @IsString({ message: 'Mã lớp phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã lớp không được để trống' })
  code!: string;

  @ApiProperty({
    description: 'ID khoa',
    example: 1,
  })
  @IsNumber({}, { message: 'ID khoa phải là số' })
  @IsNotEmpty({ message: 'ID khoa không được để trống' })
  departmentId!: number;
}
