import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RefreshTokenResponseDto {
  @ApiProperty({
    description: 'Access token mới',
    example: 'eyJhbGciOiJIUzI1NiIs...',
  })
  @Expose()
  accessToken!: string;

  @ApiProperty({
    description: 'Refresh token mới',
    example: 'dXNlcjE6cmVmcmVzaHRva2VuMTIz',
  })
  @Expose()
  refreshToken!: string;
}
