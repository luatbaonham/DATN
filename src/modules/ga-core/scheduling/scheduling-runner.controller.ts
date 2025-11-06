// import { Controller, Post, Query, Body } from '@nestjs/common';
// import { SchedulingRunnerService } from './scheduling-runner.service';
// import { CreateInputRequestDto } from '../generate-input/dto/create-input-request.dto';

// @Controller('genetic')
// export class SchedulingRunnerController {
//   constructor(
//     private readonly schedulingRunnerService: SchedulingRunnerService,
//   ) {}

//   /**
//    * Gọi API: POST /genetic/init-population?size=10
//    * Body: { examSessionId, rules }
//    */
//   @Post('init-population')
//   async initializePopulation(
//     @Body() dto: CreateInputRequestDto,
//     @Query('size') size?: number,
//   ) {
//     const population = await this.schedulingRunnerService.initializePopulation(
//       size ? +size : 10,
//       dto,
//     );
//     return {
//       message: `✅ Population initialized with ${population.individuals.length} individuals`,
//       sampleIndividual: population.individuals,
//     };
//   }
// }

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SchedulingRunnerService } from './scheduling-runner.service';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { GenerateInputService } from '../generate-input/generate-input.service'; // Import service từ generate-input
import { CreateInputRequestDto } from '../generate-input/dto/create-input-request.dto'; // Import DTO từ generate-input

@ApiTags('scheduling-runner')
@Controller('scheduling')
export class SchedulingRunnerController {
  constructor(
    private readonly schedulingRunnerService: SchedulingRunnerService,
    private readonly generateInputService: GenerateInputService, // Inject service
  ) {}

  // Endpoint mới: Tích hợp dữ liệu từ DB
  @Post('generate-from-db')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: CreateInputRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Lịch thi từ DB đã được tạo thành công.',
  })
  async generateFromDb(@Body() dto: CreateInputRequestDto) {
    // Lấy dữ liệu từ DB
    const algorithmInput =
      await this.generateInputService.generateRawInput(dto);

    // Chạy thuật toán trực tiếp với algorithmInput
    return this.schedulingRunnerService.generateAdvanced(algorithmInput);
  }
}
