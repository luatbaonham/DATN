import { Expose, Type } from 'class-transformer';
import { DeviceDto } from './device.dto';

export class SessionResponseDto {
  @Expose()
  userId!: number;

  @Expose()
  totalDevices!: number;

  @Expose()
  @Type(() => DeviceDto)
  devices!: DeviceDto[];
}
