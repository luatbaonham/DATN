// lecturer-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude, Type } from 'class-transformer';
import { UserResponseDto } from '@modules/users/dto/user-response.dto';
import { DepartmentResponseDto } from '@modules/core-data/departments/dto/department-response.dto';

@Exclude() // ẩn toàn bộ field mặc định
export class LecturerResponseDto {
  @ApiProperty({ example: 1, description: 'ID hồ sơ giảng viên' })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'GV001', description: 'Mã giảng viên' })
  @Expose()
  code!: string;

  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({
    description: 'Thông tin người dùng',
    type: UserResponseDto,
  })
  user!: UserResponseDto;

  @Expose()
  @Type(() => DepartmentResponseDto)
  @ApiProperty({
    description: 'Thông tin khoa',
    type: DepartmentResponseDto,
  })
  department!: DepartmentResponseDto;

  @ApiProperty({
    example: '2023-10-10T10:00:00Z',
    description: 'Thời gian tạo hồ sơ giảng viên',
  })
  @Expose()
  createAt?: Date;

  @ApiProperty({
    example: '2023-10-11T10:00:00Z',
    description: 'Thời gian cập nhật hồ sơ giảng viên gần nhất',
  })
  @Expose()
  updateAt?: Date;
}
