// class-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude, Type } from 'class-transformer';
import { DepartmentResponseDto } from '@modules/core-data/departments/dto/department-response.dto';

@Exclude() // ẩn toàn bộ field mặc định
export class ClassResponseDto {
  @ApiProperty({ example: 1, description: 'ID lớp học' })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'Lớp 20CLC', description: 'Tên lớp học' })
  @Expose({ name: 'className' })
  name!: string;

  @ApiProperty({ example: '20CLC', description: 'Mã lớp học' })
  @Expose({ name: 'classCode' })
  code!: string;

  @Expose()
  @Type(() => DepartmentResponseDto)
  @ApiProperty({
    description: 'Thông tin khoa',
    type: DepartmentResponseDto,
  })
  department!: DepartmentResponseDto;

  @ApiProperty({
    example: '2023-10-10T10:00:00Z',
    description: 'Thời gian tạo lớp học',
  })
  @Expose()
  createAt?: Date;

  @ApiProperty({
    example: '2023-10-11T10:00:00Z',
    description: 'Thời gian cập nhật lớp học gần nhất',
  })
  @Expose()
  updateAt?: Date;
}
