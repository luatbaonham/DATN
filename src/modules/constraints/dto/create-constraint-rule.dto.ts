// src/modules/constraints/dto/create-constraint-rule.dto.ts
import { IsBoolean, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConstraintRuleDto {
  @ApiProperty({
    description: 'ID của kỳ thi áp dụng ràng buộc',
    example: 101,
  })
  @IsInt()
  @IsOptional()
  examSessionId?: number;

  @ApiProperty({
    description: 'ID của ràng buộc được liên kết',
    example: 5,
  })
  @IsInt()
  constraintId!: number;

  @ApiProperty({
    description: 'Trạng thái kích hoạt của rule.',
    example: false,
  })
  @IsBoolean()
  isActive!: boolean;

  @ApiProperty({
    description:
      'Tham số chi tiết của rule, có thể chứa các cặp key-value tùy chỉnh',
    example: {
      maxStudents: 30,
      timeLimit: '90 phút',
    },
  })
  @IsNotEmpty()
  rule!: Record<string, any>;
}
