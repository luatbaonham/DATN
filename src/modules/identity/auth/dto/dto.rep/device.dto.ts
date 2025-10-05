import { Expose } from 'class-transformer';

export class DeviceDto {
  @Expose()
  id!: number;

  @Expose()
  deviceInfo!: string;

  @Expose()
  ipAddress?: string;

  @Expose()
  userAgent?: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  lastUsedAt?: Date;
}
