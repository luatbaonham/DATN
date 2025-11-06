// import {
//   Controller,
//   Post,
//   Body,
//   HttpCode,
//   HttpStatus,
//   Param,
// } from '@nestjs/common';
// import { ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
// import { ExamGroupingService } from './exam-grouping.service';

// @ApiTags('Algorithm Input')
// @Controller('exam-grouping')
// export class ExamGroupingController {
//   constructor(private readonly examGroupingService: ExamGroupingService) {}

//   @Post('generate/:examSessionId')
//   @HttpCode(HttpStatus.OK)
//   @ApiResponse({ status: 200, description: 'Tự động chia nhóm thi thành công' })
//   @ApiParam({
//     name: 'examSessionId',
//     type: Number,
//     description: 'ID của đợt thi cần chia nhóm',
//   })
//   async generateGroups(@Param('examSessionId') examSessionId: number) {
//     return this.examGroupingService.generateExamGroups(examSessionId);
//   }
// }
