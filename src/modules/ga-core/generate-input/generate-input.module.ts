import { Module } from '@nestjs/common';
import { GenerateInputController } from './generate-input.controller';
import { GenerateInputService } from './generate-input.service';

@Module({
  controllers: [GenerateInputController],
  providers: [GenerateInputService],
  exports: [GenerateInputService],
})
export class GenerateInputModule {}
