import { Injectable } from '@nestjs/common';
import { AdvancedScheduleDto } from './dto/advanced-schedule.dto';
import {
  RoomDto,
  ExamGroupDto,
  ProctorDto,
  ConstraintsDto,
  StudentDto,
} from './dto/advanced-schedule.dto';

// --- Định nghĩa cấu trúc dữ liệu cho thuật toán ---
type Gene = {
  examGroupId: string;
  roomId: string;
  timeSlotId: number; // ID duy nhất của kíp thi
  proctorId: string;
};
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
  morning: SimplifiedExamEvent[]; // <-- THAY ĐỔI
  afternoon: SimplifiedExamEvent[]; // <-- THAY ĐỔI
};

// --- THAY ĐỔI: TimeSlot giờ sẽ chứa đối tượng Date cụ thể ---
type TimeSlot = {
  id: number;
  date: Date; // <-- Ngày thi cụ thể
  start: number; // số phút từ 00:00
  end: number; // số phút từ 00:00
};

// --- Hằng số cho thuật toán di truyền ---
const POPULATION_SIZE = 100;
const GENERATIONS = 200;
const MUTATION_RATE = 0.1;
const TOURNAMENT_SIZE = 5;
const ELITISM_COUNT = 2;

// Trọng số cho các vi phạm ràng buộc
const HARD_CONSTRAINT_PENALTY = 1000;
const SOFT_CONSTRAINT_PENALTY = {
  STUDENT_EXAMS_PER_DAY: 10,
  INTER_LOCATION_TRAVEL: 5,
};
// Các kíp thi trong ngày (giờ * 60)
const DAILY_START_HOURS = [8, 10, 14, 16]; // 8h, 10h, 14h, 16h

@Injectable()
export class SchedulingService {
  private studentsByExamGroup!: Map<string, string[]>;
  private examGroupsById!: Map<string, ExamGroupDto>;
  private rooms!: RoomDto[];
  private proctors!: ProctorDto[];
  private constraints!: ConstraintsDto;
  private timeSlots!: TimeSlot[]; // Danh sách các kíp thi HỢP LỆ

  // --- Hàm chính để chạy thuật toán ---
  public generateAdvanced(dto: AdvancedScheduleDto) {
    this.initializeProblem(dto); // <-- Bước 1: Tạo TimeSlots hợp lệ

    // Kiểm tra nếu không có kíp thi nào hợp lệ
    if (this.timeSlots.length === 0) {
      return {
        fitness: Infinity,
        isOptimal: false,
        error: 'Không có ngày thi hợp lệ trong khoảng đã chọn.',
        timetable: [],
      };
    }

    let population = this.initializePopulation();
    let bestSchedule: Chromosome | null = null;
    let bestFitness = Infinity;

    for (let gen = 0; gen < GENERATIONS; gen++) {
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

    return this.formatOutput(bestSchedule);
  }

  // --- Các hàm trợ giúp về Ngày/Tháng ---

  /**
   * Chuyển đổi đối tượng Date thành chuỗi "YYYY-MM-DD"
   * (Rất quan trọng để so sánh với danh sách ngày lễ)
   */
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

  // --- Các bước của Thuật toán Di truyền ---

  /**
   * THAY ĐỔI LỚN: Tạo danh sách TimeSlot (kíp thi)
   * dựa trên startDate, endDate và loại bỏ Chủ Nhật, ngày lễ.
   */
  private initializeProblem(dto: AdvancedScheduleDto): void {
    // 1. Xử lý sinh viên và nhóm thi (Như cũ)
    this.studentsByExamGroup = new Map();
    this.examGroupsById = new Map(
      dto.examGroups.map((g) => [g.examGroupId, g]),
    );
    dto.students.forEach((student) => {
      student.examGroups.forEach((examGroupId) => {
        if (!this.studentsByExamGroup.has(examGroupId)) {
          this.studentsByExamGroup.set(examGroupId, []);
        }
        this.studentsByExamGroup.get(examGroupId)!.push(student.studentId);
      });
    });

    // 2. Lưu trữ phòng, giám thị, ràng buộc (Như cũ)
    this.rooms = dto.rooms;
    this.proctors = dto.proctors;
    this.constraints = dto.constraints ?? {};

    // 3. --- THAY ĐỔI LỚN: TẠO TIMESLOTS HỢP LỆ ---
    this.timeSlots = [];
    let id = 0;

    // Chuyển danh sách ngày lễ (string) thành Set để tra cứu nhanh
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
    // Kết thúc: this.timeSlots chỉ chứa các kíp thi hợp lệ
  }

  /**
   * Khởi tạo quần thể (Không đổi, chỉ đảm bảo this.timeSlots không rỗng)
   */
  private initializePopulation(): Chromosome[] {
    const population: Chromosome[] = [];
    const examGroupIds = Array.from(this.studentsByExamGroup.keys());

    if (this.timeSlots.length === 0) {
      // Đã kiểm tra ở hàm public, nhưng cẩn thận vẫn hơn
      throw new Error('Không có kíp thi hợp lệ để xếp lịch.');
    }

    for (let i = 0; i < POPULATION_SIZE; i++) {
      const chromosome: Chromosome = examGroupIds.map((examGroupId) => ({
        examGroupId,
        roomId:
          this.rooms[Math.floor(Math.random() * this.rooms.length)].roomId,
        // Chọn 1 kíp thi ngẫu nhiên từ danh sách HỢP LỆ
        timeSlotId:
          this.timeSlots[Math.floor(Math.random() * this.timeSlots.length)].id,
        proctorId:
          this.proctors[Math.floor(Math.random() * this.proctors.length)]
            .proctorId,
      }));
      population.push(chromosome);
    }
    return population;
  }

  /**
   * THAY ĐỔI: Tính điểm Fitness
   * Dùng `timeSlot.date` thay vì `timeSlot.day`
   */
  private calculateFitness(chromosome: Chromosome): number {
    let hardConflicts = 0;
    let softConflicts = 0;

    const roomSchedule = new Map<string, Gene[]>(); // key: "roomId-timeSlotId"
    const proctorSchedule = new Map<string, Gene[]>(); // key: "proctorId-timeSlotId"
    const studentSchedule = new Map<string, Gene[]>(); // key: "studentId-timeSlotId"
    const studentDailySchedule = new Map<string, Gene[]>(); // key: "studentId-date"
    const studentLocationSchedule = new Map<string, string[]>(); // key: "studentId-date"

    for (const gene of chromosome) {
      const room = this.rooms.find((r) => r.roomId === gene.roomId)!;
      const examGroup = this.examGroupsById.get(gene.examGroupId)!;
      const students = this.studentsByExamGroup.get(gene.examGroupId)!;
      const timeSlot = this.timeSlots.find((ts) => ts.id === gene.timeSlotId)!;

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
      // Dùng toDateString() để tạo key duy nhất cho mỗi NGÀY
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

  // --- Các hàm GA (Không cần thay đổi) ---

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
    const crossoverPoint = Math.floor(Math.random() * parent1.length);
    return [
      ...parent1.slice(0, crossoverPoint),
      ...parent2.slice(crossoverPoint),
    ];
  }

  private mutate(chromosome: Chromosome): Chromosome {
    const geneToMutateIndex = Math.floor(Math.random() * chromosome.length);
    const mutationType = Math.floor(Math.random() * 3);

    switch (mutationType) {
      case 0:
        chromosome[geneToMutateIndex].roomId =
          this.rooms[Math.floor(Math.random() * this.rooms.length)].roomId;
        break;
      case 1:
        // Đột biến kíp thi (chọn kíp khác từ danh sách hợp lệ)
        chromosome[geneToMutateIndex].timeSlotId =
          this.timeSlots[Math.floor(Math.random() * this.timeSlots.length)].id;
        break;
      case 2:
        chromosome[geneToMutateIndex].proctorId =
          this.proctors[
            Math.floor(Math.random() * this.proctors.length)
          ].proctorId;
        break;
    }
    return chromosome;
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
          morning: [], // <-- THAY ĐỔI: Khởi tạo mảng rỗng
          afternoon: [], // <-- THAY ĐỔI: Khởi tạo mảng rỗng
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
        examGroup: gene.examGroupId,
        courseCode: examGroup.courseCode,
        duration: examGroup.duration,
        roomId: gene.roomId, // <-- THÊM MỚI
        location: room.location, // <-- THÊM MỚI
        proctor: gene.proctorId,
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
