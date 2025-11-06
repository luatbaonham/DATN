// import {
//   Controller,
//   Post,
//   Body,
//   HttpCode,
//   HttpStatus,
//   Get,
// } from '@nestjs/common';
// import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
// import { ExamGroupingService } from './exam-grouping.service';
// import { CreateExamGroupsDto } from './dto/create-exam-groups.dto';

// @ApiTags('Algorithm Input') // Nhóm chung với Scheduling trên Swagger
// @Controller('exam-grouping') // Endpoint: /exam-grouping
// export class ExamGroupingController {
//   constructor(private readonly examGroupingService: ExamGroupingService) {}

//   @Post('generate-groups') // Endpoint: POST /exam-grouping/generate-groups
//   @HttpCode(HttpStatus.OK)
//   @ApiBody({ type: CreateExamGroupsDto })
//   @ApiResponse({
//     status: 200,
//     description: 'Chia nhóm sinh viên thành công.',
//   })
//   async generateGroups(@Body() dto: CreateExamGroupsDto) {
//     // Gọi service để thực hiện logic
//     return this.examGroupingService.generateGroups(dto);
//   }

//   @Get('process-data-file') // Endpoint: GET /exam-grouping/process-data-file
//   @HttpCode(HttpStatus.OK)
//   @ApiResponse({
//     status: 200,
//     description: 'Đọc data.json, xử lý và lưu vào output.json thành công.',
//   })
//   async processDataFile() {
//     // Gọi service để đọc file, xử lý và lưu kết quả
//     return this.examGroupingService.processDataFromFile();
//   }
// }
