import { Body, Controller, Post } from '@nestjs/common';
import { GenerateInputService } from './generate-input.service';
import { CreateInputRequestDto } from './dto/create-input-request.dto';

@Controller('generate-input')
export class GenerateInputController {
  constructor(private readonly generateInputService: GenerateInputService) {}

  @Post('generate')
  async generateSchedule(@Body() dto: CreateInputRequestDto) {
    return this.generateInputService.generate(dto);
  }
}
