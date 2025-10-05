// dto/dto.req/logout.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LogoutDto {
  @ApiProperty({
    description: 'Refresh token của thiết bị cần logout',
    example: 'dXNlcjE6cmVmcmVzaHRva2VuMTIz',
  })
  @IsString()
  refreshToken!: string;
}
