import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Locations } from './entities/locations.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Locations])],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
