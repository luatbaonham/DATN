// import { Injectable } from '@nestjs/common';
// import {
//   CreateExamGroupsDto,
//   ExamGroupOutputDto,
//   StudentOutputDto,
// } from './dto/create-exam-groups.dto';
// import * as fs from 'fs';
// import * as path from 'path';

// // Định nghĩa kiểu nội bộ cho rõ ràng
// type CourseDataMap = Map<string, { students: string[]; duration: number }>;
// type StudentGroupMap = Map<string, string[]>;

// @Injectable()
// export class ExamGroupingService {
//   /**
//    * Hàm mới: Đọc data.json, xử lý và lưu vào output.json
//    */
//   public async processDataFromFile(): Promise<{
//     success: boolean;
//     message: string;
//     outputFile: string;
//     data?: {
//       examGroups: ExamGroupOutputDto[];
//       students: StudentOutputDto[];
//     };
//   }> {
//     try {
//       // Đường dẫn tới file data.json trong thư mục src
//       // __dirname sẽ trỏ tới dist/src/modules/algorithm-input/exam-group-create
//       // Cần quay lại root project và vào src
//       const projectRoot = path.resolve(__dirname, '..', '..', '..', '..', '..');
//       const dataFilePath = path.join(
//         projectRoot,
//         'src',
//         'modules',
//         'algorithm-input',
//         'exam-group-create',
//         'data.json',
//       );
//       const outputFilePath = path.join(
//         projectRoot,
//         'src',
//         'modules',
//         'algorithm-input',
//         'exam-group-create',
//         'output.json',
//       );

//       // Đọc file data.json
//       if (!fs.existsSync(dataFilePath)) {
//         throw new Error(`File không tồn tại: ${dataFilePath}`);
//       }

//       const rawData = fs.readFileSync(dataFilePath, 'utf-8');
//       const inputData = JSON.parse(rawData);

//       // Chuyển đổi dữ liệu để phù hợp với CreateExamGroupsDto
//       const dto = this.transformInputData(inputData);

//       // Xử lý logic chia nhóm
//       const result = this.generateGroups(dto);

//       // Tạo output với metadata
//       const output = {
//         metadata: {
//           processedAt: new Date().toISOString(),
//           totalExamGroups: result.examGroups.length,
//           totalStudents: result.students.length,
//           totalCourses: new Set(result.examGroups.map((g) => g.courseCode))
//             .size,
//         },
//         data: result,
//       };

//       // Lưu kết quả vào output.json
//       fs.writeFileSync(
//         outputFilePath,
//         JSON.stringify(output, null, 2),
//         'utf-8',
//       );

//       return {
//         success: true,
//         message: 'Xử lý dữ liệu thành công',
//         outputFile: outputFilePath,
//         data: result,
//       };
//     } catch (error: any) {
//       return {
//         success: false,
//         message: `Lỗi xử lý: ${error?.message || 'Unknown error'}`,
//         outputFile: '',
//       };
//     }
//   }

//   /**
//    * Hàm phụ: Chuyển đổi dữ liệu từ data.json sang CreateExamGroupsDto
//    */
//   private transformInputData(inputData: any): CreateExamGroupsDto {
//     const rawRegistrations: Array<{ studentId: string; courseCode: string }> =
//       [];

//     // Chuyển đổi dữ liệu sinh viên
//     for (const student of inputData.rawRegistrations || []) {
//       // Xử lý trường hợp có courseCode hoặc corseCodes (lỗi typo)
//       const courses = student.courseCode || student.corseCodes || [];

//       for (const courseCode of courses) {
//         rawRegistrations.push({
//           studentId: student.studentId,
//           courseCode: courseCode,
//         });
//       }
//     }

//     return {
//       rawRegistrations,
//       allRooms: inputData.allRooms || [],
//       allCourses: inputData.allCourses || [],
//     };
//   }

//   /**
//    * Hàm chính: Chia sinh viên từ các môn học thành các nhóm thi (exam groups)
//    * dựa trên sức chứa phòng lớn nhất.
//    */
//   public generateGroups(dto: CreateExamGroupsDto): {
//     examGroups: ExamGroupOutputDto[];
//     students: StudentOutputDto[];
//   } {
//     const { rawRegistrations, allRooms, allCourses } = dto;

//     // --- BƯỚC 1: TỔNG HỢP DỮ LIỆU ---
//     const courseDataMap = this.buildCourseDataMap(rawRegistrations, allCourses);

//     // --- BƯỚC 2: TÌM SỨC CHỨA LỚN NHẤT ---
//     if (allRooms.length === 0) {
//       throw new Error('Không có phòng thi nào được cung cấp.');
//     }
//     const maxCapacity = Math.max(...allRooms.map((room) => room.capacity));
//     if (maxCapacity <= 0) {
//       throw new Error('Sức chứa phòng thi không hợp lệ.');
//     }

//     // --- BƯỚC 3 & 4: CHIA NHÓM VÀ TẠO DỮ LIỆU SINH VIÊN ---
//     const finalExamGroups: ExamGroupOutputDto[] = [];
//     const studentGroupMap: StudentGroupMap = new Map();

//     for (const [courseCode, data] of courseDataMap.entries()) {
//       const allStudentsForCourse = data.students;
//       let remainingStudentCount = allStudentsForCourse.length;
//       let studentIndex = 0;
//       let groupCounter = 1;

//       while (remainingStudentCount > 0) {
//         const groupSize = Math.min(remainingStudentCount, maxCapacity);
//         const examGroupId = `${courseCode}-G${groupCounter}`;
//         const studentsInThisGroup = allStudentsForCourse.slice(
//           studentIndex,
//           studentIndex + groupSize,
//         );

//         // 3. Tạo đối tượng ExamGroupDto
//         finalExamGroups.push({
//           examGroupId: examGroupId,
//           courseCode: courseCode,
//           studentCount: groupSize,
//           duration: data.duration,
//         });

//         // 4. Cập nhật bản đồ sinh viên (studentGroupMap)
//         for (const studentId of studentsInThisGroup) {
//           if (!studentGroupMap.has(studentId)) {
//             studentGroupMap.set(studentId, []);
//           }
//           studentGroupMap.get(studentId)!.push(examGroupId);
//         }

//         // 5. Cập nhật biến đếm
//         remainingStudentCount -= groupSize;
//         studentIndex += groupSize;
//         groupCounter++;
//       }
//     }

//     // --- BƯỚC 5: CHUYỂN ĐỔI STUDENT MAP THÀNH MẢNG ---
//     const finalStudents: StudentOutputDto[] = [];
//     for (const [studentId, examGroups] of studentGroupMap.entries()) {
//       finalStudents.push({
//         studentId: studentId,
//         examGroups: examGroups,
//       });
//     }

//     return {
//       examGroups: finalExamGroups,
//       students: finalStudents,
//     };
//   }

//   /**
//    * Hàm phụ: Xây dựng bản đồ dữ liệu các môn học
//    */
//   private buildCourseDataMap(
//     rawRegistrations: { studentId: string; courseCode: string }[],
//     allCourses: { courseCode: string; duration: number }[],
//   ): CourseDataMap {
//     const courseDataMap: CourseDataMap = new Map();
//     const courseDurationMap = new Map(
//       allCourses.map((c) => [c.courseCode, c.duration]),
//     );

//     for (const reg of rawRegistrations) {
//       const { studentId, courseCode } = reg;

//       if (!courseDataMap.has(courseCode)) {
//         const duration = courseDurationMap.get(courseCode) || 90;
//         courseDataMap.set(courseCode, {
//           students: [],
//           duration: duration,
//         });
//       }
//       courseDataMap.get(courseCode)!.students.push(studentId);
//     }
//     return courseDataMap;
//   }
// }
