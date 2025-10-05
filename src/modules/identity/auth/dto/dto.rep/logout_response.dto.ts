// dto/dto.rep/logout_response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class LogoutResponseDto {
  @ApiProperty({
    description: 'Thông báo kết quả logout',
    example: 'Đã logout thiết bị',
  })
  @Expose()
  message!: string;
}
