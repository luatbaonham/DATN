import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Room } from './entities/room.entity';
import { RoomsService } from './room.service';
import { RoomsController } from './room.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Room])],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}
