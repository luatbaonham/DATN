// dto/schedule-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsString,
  IsDateString,
  ValidateNested,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer'; // Quan trọng!
import { ConstraintsDto } from './advanced-schedule.dto';

export class ScheduleRequestDto {
  @ApiProperty({ description: 'Danh sách ID của các phòng thi hợp lệ' })
  @IsArray()
  @IsNumber({}, { each: true }) // Đảm bảo mọi phần tử trong mảng là số
  @IsNotEmpty()
  roomIds!: number[];

  @ApiProperty({
    description: 'Danh sách ID của các giảng viên (giám thị) hợp lệ',
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  lecturerIds!: number[];

  @ApiProperty({ description: 'ID của đợt thi (ExamSession) để lọc nhóm thi' })
  @IsNumber()
  @IsNotEmpty()
  examSessionId!: number;

  @ApiProperty({ example: '2025-10-01' })
  @IsDateString() // Kiểm tra định dạng YYYY-MM-DD
  @IsNotEmpty()
  startDate!: string;

  @ApiProperty({ example: '2025-10-15' })
  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @ApiProperty({ example: ['2025-10-02'] })
  @IsArray()
  @IsDateString({}, { each: true }) // Mọi phần tử phải là YYYY-MM-DD
  @IsOptional() // Cho phép gửi mảng rỗng hoặc không gửi
  holidays!: string[];

  @ApiProperty({ required: false })
  @ValidateNested() // Quan trọng: Báo cho NestJS validate cả object bên trong
  @Type(() => ConstraintsDto) // Quan trọng: Giúp NestJS biết object bên trong là class nào
  @IsOptional()
  constraints!: ConstraintsDto;
}
