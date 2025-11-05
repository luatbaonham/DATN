import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { ConstraintsDto } from './dto/advanced-schedule.dto';
import { Room } from '@modules/algorithm-input/room/entities/room.entity';
import { Lecturer } from '@modules/core-data/lecturer/entities/lecturer.entity';
import { ExamGroup } from '@modules/algorithm-input/exam-group/entities/exam-group.entity';
import { StudentExamGroup } from '@modules/algorithm-input/student-exam-group/entities/student-exam-group.entity';
import { ScheduleRequestDto } from './dto/schedule-request.dto';
import { Exam } from '@modules/result/exam/entities/exam.entity';
import { ExamRegistration } from '@modules/result/exam-registration/entities/exam-registration.entity';
import { ExamSupervisor } from '@modules/result/exam-supervisor/entities/exam-supervisor.entity';
import { Student } from '@modules/core-data/students/entities/student.entity';
import { EntityManager } from '@mikro-orm/mysql';
import { ExamSlot } from '@modules/result/exam-slot/entities/exam-slot.entity';
// --- Định nghĩa cấu trúc dữ liệu cho thuật toán ---
type Gene = {
  examGroupId: number;
  roomId: number;
  timeSlotId: number;
  proctorId: number;
};
interface RoomDto {
  roomId: number; // <-- THAY ĐỔI
  capacity: number;
  location: number; // Giữ location code (string) để check
}
interface ProctorDto {
  proctorId: number; // <-- THAY ĐỔI
}
interface ExamGroupDto {
  examGroupId: number; // <-- THAY ĐỔI
  courseCode: number;
  duration: number;
  studentCount: number;
}

type Chromosome = Gene[];

// Cấu trúc đầu ra chi tiết
type SimplifiedExamEvent = {
  time: string; // "08:00 - 09:30"
  date: string; // "2025-05-05"
  dayOfWeek: string; // "Thứ Hai"
  examGroup: string;
  courseCode: string;
  duration: number;
  // --- THAY ĐỔI: Thêm thông tin phòng vào sự kiện ---
  roomId: string;
  location: string;
  proctor: string;
  studentCount: number;
  // --- Mảng students: string[] đã bị XÓA ---
};
type TimetableDay = {
  day: string; // "Thứ Hai"
  date: string; // "2025-05-05"
  morning: SimplifiedExamEvent[];
  afternoon: SimplifiedExamEvent[];
};

// --- THAY ĐỔI: TimeSlot giờ sẽ chứa đối tượng Date cụ thể ---
type TimeSlot = {
  id: number;
  date: Date; // <-- Ngày thi cụ thể
  start: number; // số phút từ 00:00
  end: number; // số phút từ 00:00
};

// --- Hằng số cho thuật toán di truyền ---
const POPULATION_SIZE = 100; //200
const GENERATIONS = 200; // 1000
const MUTATION_RATE = 0.01;
const TOURNAMENT_SIZE = 5;
const ELITISM_COUNT = 2;

// Trọng số cho các vi phạm ràng buộc
const HARD_CONSTRAINT_PENALTY = 100000;
const SOFT_CONSTRAINT_PENALTY = {
  STUDENT_EXAMS_PER_DAY: 10,
  INTER_LOCATION_TRAVEL: 5,
  EXAM_SPACING: 25, // lịch thi gần nhau
};
// Các kíp thi trong ngày (giờ * 60)
const DAILY_START_HOURS = [8, 10, 14, 16]; // 8h, 10h, 14h, 16h

@Injectable()
export class SchedulingService {
  private studentsByExamGroup!: Map<number, number[]>;
  private examGroupsById!: Map<number, ExamGroupDto>;
  private rooms!: RoomDto[];
  private proctors!: ProctorDto[];
  private constraints!: ConstraintsDto;
  private timeSlots!: TimeSlot[];
  private roomsById!: Map<number, RoomDto>;
  private proctorsById!: Map<number, ProctorDto>;
  private timeSlotsById!: Map<number, TimeSlot>; // Key là timeSlot.id

  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Room)
    private readonly roomRepository: EntityRepository<Room>,
    @InjectRepository(Lecturer)
    private readonly lecturerRepository: EntityRepository<Lecturer>,
    @InjectRepository(ExamGroup)
    private readonly examGroupRepository: EntityRepository<ExamGroup>,
    @InjectRepository(StudentExamGroup)
    private readonly studentExamGroupRepository: EntityRepository<StudentExamGroup>,
    @InjectRepository(Exam)
    private readonly examRepository: EntityRepository<Exam>,
    @InjectRepository(ExamRegistration)
    private readonly examRegistrationRepository: EntityRepository<ExamRegistration>,
    @InjectRepository(ExamSupervisor)
    private readonly examSupervisorRepository: EntityRepository<ExamSupervisor>,
  ) {}
  public async generateAdvanced(dto: ScheduleRequestDto) {
    await this.initializeProblem(dto);
    // Kiểm tra nếu không có kíp thi nào hợp lệ
    if (this.timeSlots.length === 0) {
      return {
        fitness: Infinity,
        isOptimal: false,
        error: 'Không có ngày thi hợp lệ trong khoảng đã chọn.',
        timetable: [],
        executionTimeMs: 0,
      };
    }

    let loopGeneration = 0;
    const startTime = Date.now();
    let population = this.initializePopulation();
    let bestSchedule: Chromosome | null = null;
    let bestFitness = Infinity;

    for (let gen = 0; gen < GENERATIONS; gen++) {
      loopGeneration++;
      const populationWithFitness = population.map((chromosome) => ({
        chromosome,
        fitness: this.calculateFitness(chromosome),
      }));

      populationWithFitness.sort((a, b) => a.fitness - b.fitness);
      const currentBest = populationWithFitness[0];
      if (!bestSchedule || currentBest.fitness < bestFitness) {
        bestSchedule = currentBest.chromosome;
        bestFitness = currentBest.fitness;
      }

      if (currentBest.fitness === 0) {
        console.log(`Found perfect solution at generation ${gen}`);
        break;
      }

      const newPopulation = this.createNewGeneration(populationWithFitness);
      population = newPopulation;
    }
    // --- KẾT THÚC ĐO THỜI GIAN ---
    const endTime = Date.now();
    const executionTimeMs = endTime - startTime;
    // Nếu không tìm thấy lịch hợp lệ
    if (!bestSchedule) {
      return {
        fitness: bestFitness,
        isOptimal: false,
        error: 'Không tìm thấy lịch thi hợp lệ.',
        timetable: [],
        loopGeneration,
        executionTimeMs,
        executionTimeSeconds: parseFloat((executionTimeMs / 1000).toFixed(3)),
      };
    }
    // --- 1. LƯU VÀO DATABASE (TRỰC TIẾP) ---
    try {
      await this.em.transactional(async (em) => {
        for (const gene of bestSchedule!) {
          await this.deleteScheduleBySessionId(dto.examSessionId);
          const examGroup = this.examGroupsById.get(gene.examGroupId);
          const timeSlot = this.timeSlotsById.get(gene.timeSlotId);
          const students = this.studentsByExamGroup.get(gene.examGroupId) || [];
          if (!examGroup || !timeSlot) {
            console.warn(`Bỏ qua Gene vì thiếu dữ liệu: ${gene.examGroupId}`);
            continue;
          }
          const exam = new Exam();
          exam.examGroup = em.getReference(ExamGroup, gene.examGroupId);
          exam.room = em.getReference(Room, gene.roomId);
          exam.examDate = timeSlot.date;
          exam.duration = examGroup.duration;
          exam.status = 'Draft';
          exam.examSlot = em.getReference(ExamSlot, 1);
          await em.persist(exam);

          const supervisor = new ExamSupervisor();
          supervisor.exam = exam;
          supervisor.lecturer = em.getReference(Lecturer, gene.proctorId);
          supervisor.role = 'Supervisor'; // lam sao để xóa nó trong db
          await em.persist(supervisor);

          const registrations: ExamRegistration[] = [];
          for (const studentId of students) {
            const reg = new ExamRegistration();
            reg.exam = exam;
            reg.student = em.getReference(Student, studentId);
            registrations.push(reg);
          }
          await em.persist(registrations);
        }
      });
    } catch (error) {
      console.error('LỖI khi lưu lịch thi vào DB:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Lỗi khi lưu vào database: ${message}`,
      );
    }
    const result = this.formatOutput(bestSchedule);

    return {
      ...result,
      loopGeneration: loopGeneration,
      executionTimeMs: executionTimeMs,
      executionTimeSeconds: parseFloat((executionTimeMs / 1000).toFixed(3)),
    };
  }
  public async deleteScheduleBySessionId(sessionId: number): Promise<{
    deletedExams: number;
    deletedRegistrations: number;
    deletedSupervisors: number;
  }> {
    // 1. Tìm tất cả các Exam thuộc ExamSession này (qua ExamGroup)
    const examsToDelete = await this.examRepository.find({
      examGroup: { examSession: sessionId },
    });

    if (examsToDelete.length === 0) {
      return {
        deletedExams: 0,
        deletedRegistrations: 0,
        deletedSupervisors: 0,
      };
    }

    const examIds = examsToDelete.map((e) => e.id);

    // 2. Xóa tất cả ExamRegistration liên quan
    const regDeleteResult = await this.examRegistrationRepository.nativeDelete({
      exam: { $in: examIds },
    });

    // 3. Xóa tất cả ExamSupervisor liên quan
    const supDeleteResult = await this.examSupervisorRepository.nativeDelete({
      exam: { $in: examIds },
    });

    // 4. Xóa các Exam
    const examDeleteResult = await this.examRepository.nativeDelete({
      id: { $in: examIds },
    });

    return {
      deletedExams: examDeleteResult,
      deletedRegistrations: regDeleteResult,
      deletedSupervisors: supDeleteResult,
    };
  }
  private formatDateToYYYYMMDD(date: Date): string {
    const y = date.getFullYear();
    const m = ('0' + (date.getMonth() + 1)).slice(-2);
    const d = ('0' + date.getDate()).slice(-2);
    return `${y}-${m}-${d}`;
  }

  /**
   * Lấy tên tiếng Việt của Thứ
   */
  private getDayOfWeekName(dayIndex: number): string {
    const days = [
      'Chủ Nhật',
      'Thứ Hai',
      'Thứ Ba',
      'Thứ Tư',
      'Thứ Năm',
      'Thứ Sáu',
      'Thứ Bảy',
    ];
    return days[dayIndex];
  }
  private shuffleArray<T>(array: readonly T[]): T[] {
    const newArr = [...array]; // Tạo bản sao
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  }
  private async initializeProblem(dto: ScheduleRequestDto): Promise<void> {
    this.studentsByExamGroup = new Map();
    // CT để tìm kiếm nhanh hơn
    this.constraints = {
      ...(dto.constraints || {}), // Ghi đè bằng DTO nếu nó tồn tại
    };
    const roomEntities = await this.roomRepository.find({
      id: { $in: dto.roomIds },
    });
    const lecturerEntities = await this.lecturerRepository.find({
      id: { $in: dto.lecturerIds },
    });
    this.rooms = roomEntities.map(
      (r): RoomDto => ({
        roomId: r.id, // Dùng 'code' làm ID
        capacity: r.capacity,
        location: r.location.id, // Giả sử location có 'id'
      }),
    );
    this.proctors = lecturerEntities.map(
      (l): ProctorDto => ({
        proctorId: l.id, // Dùng 'lecturerCode' làm ID
      }),
    );
    // 3. Tải các Nhóm thi (ExamGroup) thuộc Đợt thi (ExamSession)
    const examGroupEntities = await this.examGroupRepository.find(
      { examSession: dto.examSessionId },
      { populate: ['course'] },
    );
    const examGroupIds = examGroupEntities.map((eg) => eg.id);
    // 4. Tải liên kết Sinh viên - Nhóm thi (StudentExamGroup)
    const studentGroupLinks = await this.studentExamGroupRepository.find(
      { examGroup: { $in: examGroupIds } },
      { populate: ['student'] }, // Populate 'student' để lấy studentId
    );
    this.studentsByExamGroup = new Map<number, number[]>();
    this.examGroupsById = new Map<number, ExamGroupDto>();
    for (const link of studentGroupLinks) {
      // Lấy 'id' của examGroup từ entity đã tải
      const examGroupId = examGroupEntities.find(
        (eg) => eg.id === link.examGroup.id,
      )!.id;
      const studentId = (link.student as any).id;
      if (!this.studentsByExamGroup.has(examGroupId)) {
        this.studentsByExamGroup.set(examGroupId, []);
      }
      this.studentsByExamGroup.get(examGroupId)!.push(studentId);
    }
    for (const eg of examGroupEntities) {
      const studentCount = this.studentsByExamGroup.get(eg.id)?.length || 0;

      const duration = (eg.course as any).durationCourseExam; // Cần thay thế 'duration' này
      if (typeof duration !== 'number') {
        throw new Error(`Không tìm thấy duration cho môn học ${eg.course.id}`);
      }
      this.examGroupsById.set(eg.id, {
        examGroupId: eg.id,
        courseCode: eg.course.id,
        duration: duration,
        studentCount: studentCount, // Sử dụng số lượng SV thực tế
      });
    }
    this.roomsById = new Map(this.rooms.map((r) => [r.roomId, r]));
    this.proctorsById = new Map(this.proctors.map((p) => [p.proctorId, p]));
    // 3. --- THAY ĐỔI LỚN: TẠO TIMESLOTS HỢP LỆ ---
    this.timeSlots = [];
    let id = 0;
    const holidaySet = new Set(dto.holidays);

    // Dùng 'T00:00:00' để tránh lỗi múi giờ
    const start = new Date(dto.startDate + 'T00:00:00');
    const end = new Date(dto.endDate + 'T00:00:00');

    // Lặp qua từng ngày trong khoảng đã cho
    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      // 3a. Loại bỏ Chủ Nhật (getDay() === 0)
      if (d.getDay() === 0) {
        continue;
      }
      // 3b. Loại bỏ ngày lễ
      const dateString = this.formatDateToYYYYMMDD(d);
      if (holidaySet.has(dateString)) {
        continue;
      }
      // 3c. Ngày này hợp lệ -> Thêm các kíp thi trong ngày
      for (const startHour of DAILY_START_HOURS) {
        this.timeSlots.push({
          id: id++,
          date: new Date(d), // Phải tạo Date mới, vì 'd' là biến lặp
          start: startHour * 60,
          end: 0,
        });
      }
    }
    this.timeSlotsById = new Map(this.timeSlots.map((ts) => [ts.id, ts]));
  }

  /**
   * Khởi tạo quần thể (Không đổi, chỉ đảm bảo this.timeSlots không rỗng)
   */
  private initializePopulation(): Chromosome[] {
    if (this.timeSlots.length === 0) {
      throw new Error('Không có kíp thi hợp lệ để xếp lịch.');
    }

    const population: Chromosome[] = [];
    for (let i = 0; i < POPULATION_SIZE; i++) {
      population.push(this.createGreedyChromosome());
    }
    return population;
  }
  private createGreedyChromosome(): Chromosome {
    const chromosome: Chromosome = [];

    // Các lịch trình tạm thời chỉ dùng để xây dựng cá thể này
    const roomSchedule = new Map<string, boolean>(); // key: "roomId-timeSlotId"
    const proctorSchedule = new Map<string, boolean>(); // key: "proctorId-timeSlotId"
    const studentSchedule = new Map<string, boolean>(); // key: "studentId-timeSlotId"

    // --- TỐI ƯU QUAN TRỌNG ---
    // Sắp xếp các nhóm thi theo số lượng sinh viên giảm dần.
    // Lý do: nhóm lớn khó tìm phòng hơn → đặt trước tăng khả năng thành công
    const allExamGroups = Array.from(this.examGroupsById.values());
    allExamGroups.sort((a, b) => b.studentCount - a.studentCount);

    // Lấy danh sách ID đã được sắp xếp
    const sortedExamGroupIds = allExamGroups.map((g) => g.examGroupId);

    const shuffledTimeSlots = this.shuffleArray(this.timeSlots);
    const shuffledRooms = this.shuffleArray(this.rooms);
    const shuffledProctors = this.shuffleArray(this.proctors);

    for (const examGroupId of sortedExamGroupIds) {
      // Lặp qua các nhóm đã sắp xếp
      const examGroup = this.examGroupsById.get(examGroupId)!;
      const students = this.studentsByExamGroup.get(examGroupId)!;
      let isAssigned = false;

      // --- Bắt đầu tìm kiếm vị trí (tham lam) ---
      for (const timeSlot of shuffledTimeSlots) {
        // đảm bảo không có một sinh viên thi 2 môn cùng kíp.
        let studentConflict = false;
        for (const studentId of students) {
          const studentKey = `${studentId}-${timeSlot.id}`;
          if (studentSchedule.has(studentKey)) {
            studentConflict = true;
            break;
          }
        }
        if (studentConflict) continue; // Thử kíp thi khác

        // 2. Kíp thi này ổn, tìm Phòng
        for (const room of shuffledRooms) {
          // 2a. Kiểm tra sức chứa (Rất quan trọng với dữ liệu của bạn)
          if (examGroup.studentCount > room.capacity) {
            continue; // Thử phòng khác
          }
          // 2b. Kiểm tra phòng có bận không
          const roomKey = `${room.roomId}-${timeSlot.id}`;
          if (roomSchedule.has(roomKey)) {
            continue; // Thử phòng khác
          }

          // 3. Phòng này ổn, tìm Giám thị
          for (const proctor of shuffledProctors) {
            const proctorKey = `${proctor.proctorId}-${timeSlot.id}`;
            // 3a. Kiểm tra giám thị có bận không
            if (proctorSchedule.has(proctorKey)) {
              continue; // Thử giám thị khác
            }

            // --- TÌM THẤY! ---
            const gene: Gene = {
              examGroupId,
              roomId: room.roomId,
              timeSlotId: timeSlot.id,
              proctorId: proctor.proctorId,
            };
            chromosome.push(gene);

            // Cập nhật lịch trình tạm thời
            roomSchedule.set(roomKey, true);
            proctorSchedule.set(proctorKey, true);
            students.forEach((studentId) => {
              const studentKey = `${studentId}-${timeSlot.id}`;
              studentSchedule.set(studentKey, true);
            });

            isAssigned = true;
            break; // Thoát vòng lặp Giám thị
          } // kết thúc vòng lặp Giám thị
          if (isAssigned) break; // Thoát vòng lặp Phòng
        } // kết thúc vòng lặp Phòng
        if (isAssigned) break; // Thoát vòng lặp Kíp thi
      } // kết thúc vòng lặp Kíp thi

      // --- KHÔNG TÌM THẤY VỊ TRÍ HỢP LỆ ---
      if (!isAssigned) {
        // Gán ngẫu nhiên (Fallback)
        const gene: Gene = {
          examGroupId,
          roomId: shuffledRooms[0].roomId,
          timeSlotId: shuffledTimeSlots[0].id,
          proctorId: shuffledProctors[0].proctorId,
        };
        chromosome.push(gene);
      }
    } // kết thúc vòng lặp Nhóm thi
    // Sắp xếp lại chromosome theo thứ tự ID ban đầu (quan trọng cho Crossover)
    chromosome.sort((a, b) => a.examGroupId - b.examGroupId);
    return chromosome;
  }
  private calculateFitness(chromosome: Chromosome): number {
    let hardConflicts = 0;
    let softConflicts = 0;

    const roomSchedule = new Map<string, Gene[]>(); // key: "roomId-timeSlotId"
    const proctorSchedule = new Map<string, Gene[]>(); // key: "proctorId-timeSlotId"
    const studentSchedule = new Map<string, Gene[]>(); // key: "studentId-timeSlotId"
    const studentDailySchedule = new Map<string, Gene[]>(); // key: "studentId-date"
    const studentLocationSchedule = new Map<string, number[]>(); // key: "studentId-date"
    // Mục đích: kiểm tra khoảng cách ngày thi
    const studentExamSlots = new Map<number, TimeSlot[]>();
    for (const gene of chromosome) {
      // CT
      const room = this.roomsById.get(gene.roomId)!;
      const examGroup = this.examGroupsById.get(gene.examGroupId)!;
      const students = this.studentsByExamGroup.get(gene.examGroupId)!;
      const timeSlot = this.timeSlotsById.get(gene.timeSlotId)!;

      // Ràng buộc cứng 4: Sức chứa phòng (Như cũ)
      if (examGroup.studentCount > room.capacity) {
        hardConflicts++;
      }

      // Kiểm tra trùng lịch phòng, giám thị, sinh viên (Như cũ)
      const roomKey = `${gene.roomId}-${gene.timeSlotId}`;
      const proctorKey = `${gene.proctorId}-${gene.timeSlotId}`;

      if (!roomSchedule.has(roomKey)) roomSchedule.set(roomKey, []);
      roomSchedule.get(roomKey)!.push(gene);

      if (!proctorSchedule.has(proctorKey)) proctorSchedule.set(proctorKey, []);
      proctorSchedule.get(proctorKey)!.push(gene);

      // --- THAY ĐỔI: Dùng `timeSlot.date` ---
      const dateKey = timeSlot.date.toDateString();

      students.forEach((studentId) => {
        // Ràng buộc cứng: Sinh viên trùng kíp (Như cũ)
        const studentKey = `${studentId}-${gene.timeSlotId}`;
        if (!studentSchedule.has(studentKey))
          studentSchedule.set(studentKey, []);
        studentSchedule.get(studentKey)!.push(gene);

        // Ràng buộc mềm: Số ca/ngày (Dùng dateKey)
        const studentDayKey = `${studentId}-${dateKey}`;
        if (!studentDailySchedule.has(studentDayKey))
          studentDailySchedule.set(studentDayKey, []);
        studentDailySchedule.get(studentDayKey)!.push(gene);

        // Ràng buộc mềm: Di chuyển địa điểm (Dùng dateKey)
        if (this.constraints.avoidInterLocationTravel) {
          if (!studentLocationSchedule.has(studentDayKey))
            studentLocationSchedule.set(studentDayKey, []);
          if (
            !studentLocationSchedule.get(studentDayKey)!.includes(room.location)
          ) {
            studentLocationSchedule.get(studentDayKey)!.push(room.location);
          }
        }
        if (!studentExamSlots.has(studentId)) {
          studentExamSlots.set(studentId, []);
        }
        studentExamSlots.get(studentId)!.push(timeSlot);
      });
    }

    // Tính điểm vi phạm (Như cũ)
    roomSchedule.forEach((v) => {
      if (v.length > 1) hardConflicts += v.length - 1;
    });
    proctorSchedule.forEach((v) => {
      if (v.length > 1) hardConflicts += v.length - 1;
    });
    studentSchedule.forEach((v) => {
      if (v.length > 1) hardConflicts += v.length - 1;
    });

    if (this.constraints.maxExamsPerStudentPerDay) {
      studentDailySchedule.forEach((v) => {
        if (v.length > this.constraints.maxExamsPerStudentPerDay!) {
          softConflicts += SOFT_CONSTRAINT_PENALTY.STUDENT_EXAMS_PER_DAY;
        }
      });
    }

    if (this.constraints.avoidInterLocationTravel) {
      studentLocationSchedule.forEach((v) => {
        if (v.length > 1) {
          softConflicts += SOFT_CONSTRAINT_PENALTY.INTER_LOCATION_TRAVEL;
        }
      });
    }
    return hardConflicts * HARD_CONSTRAINT_PENALTY + softConflicts;
  }
  private createNewGeneration(
    populationWithFitness: { chromosome: Chromosome; fitness: number }[],
  ): Chromosome[] {
    const newPopulation: Chromosome[] = [];

    for (let i = 0; i < ELITISM_COUNT; i++) {
      newPopulation.push(populationWithFitness[i].chromosome);
    }
    while (newPopulation.length < POPULATION_SIZE) {
      const parent1 = this.tournamentSelection(populationWithFitness);
      const parent2 = this.tournamentSelection(populationWithFitness);
      let child = this.crossover(parent1, parent2);
      if (Math.random() < MUTATION_RATE) {
        child = this.mutate(child);
      }
      newPopulation.push(child);
    }
    return newPopulation;
  }
  private tournamentSelection(
    populationWithFitness: { chromosome: Chromosome; fitness: number }[],
  ): Chromosome {
    let best: { chromosome: Chromosome; fitness: number } | null = null;
    for (let i = 0; i < TOURNAMENT_SIZE; i++) {
      const randomIndividual =
        populationWithFitness[
          Math.floor(Math.random() * populationWithFitness.length)
        ];
      if (!best || randomIndividual.fitness < best.fitness) {
        best = randomIndividual;
      }
    }
    return best!.chromosome;
  }

  private crossover(parent1: Chromosome, parent2: Chromosome): Chromosome {
    const child: Chromosome = [];
    for (let i = 0; i < parent1.length; i++) {
      if (Math.random() < 0.5) {
        child.push(parent1[i]);
      } else {
        child.push(parent2[i]);
      }
    }
    return child;
  }
  // scheduling.service.ts

  private mutate(chromosome: Chromosome): Chromosome {
    const geneToMutateIndex = Math.floor(Math.random() * chromosome.length);
    const gene = { ...chromosome[geneToMutateIndex] }; // Tạo bản sao
    const originalGene = chromosome[geneToMutateIndex];

    // Lấy thông tin cố định của gien
    const examGroup = this.examGroupsById.get(gene.examGroupId)!;
    const students = this.studentsByExamGroup.get(gene.examGroupId)!;

    const mutationType = Math.floor(Math.random() * 3);
    let attempts = 0;
    const MAX_ATTEMPTS = 10; // Thử tìm 10 lần

    switch (mutationType) {
      // --- Đột biến Kíp thi (quan trọng nhất) ---
      case 0: {
        let newTimeSlotId: number;
        let isConflict = true;
        attempts = 0;

        while (isConflict && attempts < MAX_ATTEMPTS) {
          attempts++;
          newTimeSlotId =
            this.timeSlots[Math.floor(Math.random() * this.timeSlots.length)]
              .id;
          if (newTimeSlotId === gene.timeSlotId) continue; // Phải là kíp mới

          gene.timeSlotId = newTimeSlotId;
          isConflict = this.checkGeneConflict(
            chromosome,
            gene,
            geneToMutateIndex,
          );
        }

        if (!isConflict) {
          chromosome[geneToMutateIndex] = gene; // Áp dụng đột biến
        }
        break;
      }

      // --- Đột biến Phòng ---
      case 1: {
        let newRoomId: string;
        let isConflict = true;
        attempts = 0;

        while (isConflict && attempts < MAX_ATTEMPTS) {
          attempts++;
          const newRoom =
            this.rooms[Math.floor(Math.random() * this.rooms.length)];
          if (newRoom.roomId === gene.roomId) continue;

          // Ràng buộc cứng: Sức chứa
          if (examGroup.studentCount > newRoom.capacity) {
            continue;
          }

          gene.roomId = newRoom.roomId;
          isConflict = this.checkGeneConflict(
            chromosome,
            gene,
            geneToMutateIndex,
          );
        }

        if (!isConflict) {
          chromosome[geneToMutateIndex] = gene; // Áp dụng đột biến
        }
        break;
      }

      // --- Đột biến Giám thị ---
      case 2: {
        let newProctorId: number;
        let isConflict = true;
        attempts = 0;

        while (isConflict && attempts < MAX_ATTEMPTS) {
          attempts++;
          newProctorId =
            this.proctors[Math.floor(Math.random() * this.proctors.length)]
              .proctorId;
          if (newProctorId === gene.proctorId) continue;

          gene.proctorId = newProctorId;
          isConflict = this.checkGeneConflict(
            chromosome,
            gene,
            geneToMutateIndex,
          );
        }

        if (!isConflict) {
          chromosome[geneToMutateIndex] = gene; // Áp dụng đột biến
        }
        break;
      }
    }

    return chromosome;
  }
  private checkGeneConflict(
    chromosome: Chromosome,
    mutatedGene: Gene,
    mutatedGeneIndex: number,
  ): boolean {
    const students = this.studentsByExamGroup.get(mutatedGene.examGroupId)!;

    for (let i = 0; i < chromosome.length; i++) {
      if (i === mutatedGeneIndex) continue; // Không so sánh với chính nó

      const otherGene = chromosome[i];

      // 1. Kiểm tra xung đột Kíp (TimeSlot)
      if (otherGene.timeSlotId !== mutatedGene.timeSlotId) {
        continue; // Khác kíp thi, không thể xung đột
      }

      // --- Cùng Kíp thi, kiểm tra xung đột tài nguyên ---

      // 2. Xung đột Phòng
      if (otherGene.roomId === mutatedGene.roomId) {
        return true; // Xung đột phòng
      }

      // 3. Xung đột Giám thị
      if (otherGene.proctorId === mutatedGene.proctorId) {
        return true; // Xung đột giám thị
      }

      // 4. Xung đột Sinh viên (phần nặng nhất)
      const otherStudents = this.studentsByExamGroup.get(
        otherGene.examGroupId,
      )!;
      // Tìm sinh viên chung
      if (students.some((s) => otherStudents.includes(s))) {
        return true; // Xung đột sinh viên
      }
    }

    return false; // Không có xung đột cứng
  }

  /**
   * THAY ĐỔI: Định dạng đầu ra
   * Tạo cấu trúc lịch thi dựa trên ngày/tháng cụ thể
   */
  private formatOutput(chromosome: Chromosome | null) {
    if (!chromosome) {
      return {
        fitness: Infinity,
        isOptimal: false,
        error: 'Không thể tạo lịch thi.',
        timetable: [],
      };
    }

    const fitness = this.calculateFitness(chromosome);

    // Dùng Map để nhóm các kỳ thi theo ngày
    // Key: "YYYY-MM-DD", Value: TimetableDay
    const timetableMap = new Map<string, TimetableDay>();

    chromosome.forEach((gene) => {
      const timeSlot = this.timeSlots.find((ts) => ts.id === gene.timeSlotId)!;
      const examGroup = this.examGroupsById.get(gene.examGroupId)!;
      const room = this.rooms.find((r) => r.roomId === gene.roomId)!;
      // --- THAY ĐỔI: Chỉ lấy count, không lấy mảng students ---
      const studentCount = this.studentsByExamGroup.get(
        gene.examGroupId,
      )!.length;

      // Lấy thông tin ngày, thứ
      const dateKey = this.formatDateToYYYYMMDD(timeSlot.date);
      const dayName = this.getDayOfWeekName(timeSlot.date.getDay());

      // Nếu chưa có ngày này trong Map, khởi tạo
      if (!timetableMap.has(dateKey)) {
        timetableMap.set(dateKey, {
          day: dayName,
          date: dateKey,
          morning: [], // Khởi tạo mảng rỗng
          afternoon: [], // Khởi tạo mảng rỗng
        });
      }

      // Lấy lịch của ngày hôm đó
      const daySchedule = timetableMap.get(dateKey)!;
      const sessionKey = timeSlot.start < 12 * 60 ? 'morning' : 'afternoon';

      // Tạo chi tiết giờ thi
      const startTime = `${Math.floor(timeSlot.start / 60)}:${('0' + (timeSlot.start % 60)).slice(-2)}`;
      const endTimeMinutes = timeSlot.start + examGroup.duration;
      const endTime = `${Math.floor(endTimeMinutes / 60)}:${('0' + (endTimeMinutes % 60)).slice(-2)}`;

      // --- THAY ĐỔI: Tạo đối tượng sự kiện mới (nhẹ hơn) ---
      const examEvent: SimplifiedExamEvent = {
        time: `${startTime} - ${endTime}`,
        date: dateKey,
        dayOfWeek: dayName,
        examGroup: gene.examGroupId.toString(),
        courseCode: examGroup.courseCode.toString(),
        duration: examGroup.duration,
        roomId: gene.roomId.toString(), // <-- THÊM MỚI
        location: room.location.toString(), // <-- THÊM MỚI
        proctor: gene.proctorId.toString(),
        studentCount: studentCount, // <-- Đã lấy số lượng
        // Không còn mảng students
      };

      // --- THAY ĐỔI: Push thẳng sự kiện vào mảng morning/afternoon ---
      daySchedule[sessionKey].push(examEvent);
    });

    // Chuyển Map thành Array và sắp xếp theo ngày
    const timetable: TimetableDay[] = Array.from(timetableMap.values()).sort(
      (a, b) => a.date.localeCompare(b.date),
    );

    // Sắp xếp các ca thi trong mỗi buổi theo giờ
    timetable.forEach((day) => {
      day.morning.sort((a, b) => a.time.localeCompare(b.time));
      day.afternoon.sort((a, b) => a.time.localeCompare(b.time));
    });

    return {
      fitness,
      isOptimal: fitness === 0,
      timetable: timetable, // Trả về mảng lịch thi đã sắp xếp
    };
  }
}
