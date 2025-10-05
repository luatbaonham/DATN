import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsBoolean, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ description: 'Mã phòng học', example: 'P101' })
  @IsString()
  code!: string;

  @ApiProperty({ description: 'Sức chứa sinh viên', example: 60 })
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiProperty({ description: 'ID địa điểm / cơ sở', example: 1 })
  @IsInt()
  location_id!: number;

  @ApiProperty({ description: 'Loại phòng', example: 'LT' })
  @IsString()
  type!: string;

  @ApiProperty({ description: 'Phòng khả dụng hay không', example: true })
  @IsBoolean()
  is_active!: boolean;
}
