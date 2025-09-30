// supervisor-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude, Type } from 'class-transformer';
import { LecturerResponseDto } from '@modules/core-data/lecturer/dto/lecturer-response.dto';

@Exclude() // ẩn toàn bộ field mặc định
export class SupervisorResponseDto {
  @ApiProperty({ example: 1, description: 'ID hồ sơ giám thị' })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'GT001', description: 'Mã giám thị' })
  @Expose()
  code!: string;

  @Expose()
  @Type(() => LecturerResponseDto)
  @ApiProperty({
    description: 'Thông tin giảng viên',
    type: LecturerResponseDto,
  })
  lecturer!: LecturerResponseDto;

  @ApiProperty({
    example: '2023-10-10T10:00:00Z',
    description: 'Thời gian tạo hồ sơ giám thị',
  })
  @Expose()
  createAt?: Date;

  @ApiProperty({
    example: '2023-10-11T10:00:00Z',
    description: 'Thời gian cập nhật hồ sơ giám thị gần nhất',
  })
  @Expose()
  updateAt?: Date;
}
