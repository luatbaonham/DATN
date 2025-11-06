import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  ValidateNested,
  IsObject,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO để nhận các thông tin của thuật toán mà FE gửi( exam session, các ràng buộc)
class RuleDto {
  @ApiProperty({ example: 24 })
  @IsInt()
  constraintId!: number; // ID của constraint trong DB

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive!: boolean; // bật / tắt constraint

  @ApiProperty({
    example: { holiday: ['2025-10-20'] },
    description: 'Chi tiết rule, dạng JSON, mỗi constraint có format khác nhau',
  })
  @IsObject()
  rule!: Record<string, any>; // nội dung rule FE nhập
}

export class CreateInputRequestDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  examSessionId!: number; // ID của đợt thi mà người dùng chọn

  @ApiProperty({ type: [RuleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuleDto)
  rules!: RuleDto[]; // danh sách ràng buộc được FE gửi
}

/**{
  "examSessionId": 1,
  "rules": [
    { "constraintId": 24, "isActive": true, "rule": {"holiday": ["2025-10-20"]} },
    { "constraintId": 25, "isActive": true, "rule": {"max": 2} }
  ]
}*/
