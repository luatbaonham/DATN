import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Locations } from '@modules/algorithm-input/location/entities/locations.entity';

@Entity({ tableName: 'rooms' })
export class Room {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  code!: string; // Mã phòng (ví dụ: P101, LAB01)

  @Property()
  capacity!: number; // Sức chứa (bao nhiêu sinh viên)

  @Property()
  type!: string; // Loại phòng (LT = Lý thuyết, TH = Thực hành, Lab = Phòng máy)

  @Property({ default: true })
  is_active!: boolean; // Phòng có khả dụng không

  @ManyToOne(() => Locations)
  location!: Locations;

  @Property({ onCreate: () => new Date() })
  createAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updateAt?: Date;
}
