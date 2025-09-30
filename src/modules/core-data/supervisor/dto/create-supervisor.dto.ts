// create-supervisor.dto.ts
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupervisorDto {
  @ApiProperty({
    description: 'Mã giám thị',
    example: 'GT001',
  })
  @IsString({ message: 'Mã giám thị phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã giám thị không được để trống' })
  code!: string;

  @ApiProperty({
    description: 'ID giảng viên',
    example: 1,
  })
  @IsNumber({}, { message: 'ID giảng viên phải là số' })
  @IsNotEmpty({ message: 'ID giảng viên không được để trống' })
  lecturerId!: number;
}
