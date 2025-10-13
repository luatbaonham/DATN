// src/modules/constraints/dto/create-constraint.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConstraintDto {
  @ApiProperty({
    description: 'Mã ràng buộc duy nhất',
    example: 'NO_DUPLICATE_SUPERVISOR',
  })
  @IsString()
  @IsNotEmpty()
  constraintCode!: string;

  @ApiProperty({
    description: 'Mô tả chi tiết về ràng buộc',
    example: 'Giảng viên không được coi 2 ca cùng giờ',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'Loại ràng buộc(CỨNG/MỀM)',
    example: 'CỨNG',
  })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({
    description:
      'Phạm vi áp dụng của ràng buộc(student / room / lecturer / exam_group)',
    example: 'lecturer',
  })
  @IsString()
  @IsNotEmpty()
  scope!: string;
}
