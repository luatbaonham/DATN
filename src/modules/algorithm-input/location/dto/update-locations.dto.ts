import { PartialType } from '@nestjs/swagger';
import { CreateLocationDto } from './create-locations.dto';

export class UpdateLocationsDto extends PartialType(CreateLocationDto) {}
