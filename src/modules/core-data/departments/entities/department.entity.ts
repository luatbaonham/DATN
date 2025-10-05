import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Locations } from '@modules/algorithm-input/location/entities/locations.entity';
import { Classes } from '@modules/core-data/classes/entities/class.entity';
import { Lecturer } from '@modules/core-data/lecturer/entities/lecturer.entity';

@Entity()
export class Department {
  @PrimaryKey()
  id!: number;

  @Property()
  departmentName!: string;

  @Property()
  departmentCode!: string;

  @ManyToOne(() => Locations)
  location!: Locations;

  @OneToMany(() => Classes, (lop) => lop.department)
  class = new Collection<Classes>(this);

  @OneToMany(() => Lecturer, (gVien) => gVien.department)
  lecturer = new Collection<Lecturer>(this);

  @Property({ onCreate: () => new Date() })
  createAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updateAt?: Date;
}
