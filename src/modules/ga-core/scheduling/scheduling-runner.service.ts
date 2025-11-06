import { EntityManager } from '@mikro-orm/core';
import { Department } from '@modules/core-data/departments/entities/department.entity';
import { Exam } from '@modules/result/exam/entities/exam.entity';
import { Injectable } from '@nestjs/common';

// dữ liệu từ generate input (new)
interface AlgorithmInput {
  examSession: {
    id: number;
    name: string;
    startDate: string; // 'YYYY-MM-DD'
    endDate: string; // 'YYYY-MM-DD'
    location: string;
  };
  examGroups: Array<{
    id: number;
    code: string;
    expectedStudentCount: number;
    duration_course_exam: number;
    courseId: number;
    courseCode: string;
    courseName: string;
  }>;
  rooms: Array<{
    id: number;
    code: string;
    capacity: number;
    location: string;
  }>;
  lecturers: Array<{
    id: number;
    code: string;
    departmentId: Department;
  }>;
  studentExamGroups: Array<{
    studentId: string;
    studentName: string;
    examGroups: Array<{ code: string; name: string }>;
  }>;
  constraints: Array<{
    id: number;
    code: string;
    description: string;
    type: string;
    scope: string;
    isActive: boolean;
    rule: Record<string, any>;
  }>;
}

// --- Định nghĩa cấu trúc dữ liệu cho thuật toán ---
type Gene = {
  examGroupId: number;
  roomId: number;
  timeSlotId: number; // ID duy nhất của kíp thi
  proctorId: number;
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
  roomId: number;
  location: string;
  proctor: number;
  studentCount: number;
};
type TimetableDay = {
  day: string; // "Thứ Hai"
  date: string; // "2025-05-05"
  morning: SimplifiedExamEvent[];
  afternoon: SimplifiedExamEvent[];
};

type TimeSlot = {
  id: number;
  date: Date;
  start: number; // số phút từ 00:00
  end: number; // số phút từ 00:00
};

// --- Hằng số cho thuật toán di truyền ---
const POPULATION_SIZE = 100;
const GENERATIONS = 200;
const MUTATION_RATE = 0.01;
const TOURNAMENT_SIZE = 5;
const ELITISM_COUNT = 2;

// Trọng số cho các vi phạm ràng buộc
const HARD_CONSTRAINT_PENALTY = 100000;
const SOFT_CONSTRAINT_PENALTY = {
  STUDENT_EXAMS_PER_DAY: 10,
  INTER_LOCATION_TRAVEL: 5,
  EXAM_SPACING: 25,
};

@Injectable()
export class SchedulingRunnerService {
  constructor(private readonly em: EntityManager) {}

  private studentsByExamGroup!: Map<string, string[]>;
  private examGroupsById!: Map<number, any>;
  private rooms!: Array<any>;
  private proctors!: Array<any>;
  private constraints!: any;
  private timeSlots!: TimeSlot[];
  private roomsById!: Map<number, any>;
  private proctorsById!: Map<number, any>;
  private timeSlotsById!: Map<number, TimeSlot>;

  // --- Hàm chính để chạy thuật toán ---
  public async generateAdvanced(input: AlgorithmInput) {
    await this.initializeProblem(input);

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

    const endTime = Date.now();
    const executionTimeMs = endTime - startTime;
    const result = this.formatOutput(bestSchedule);

    return {
      ...result,
      loopGeneration: loopGeneration,
      executionTimeMs: executionTimeMs,
      executionTimeSeconds: parseFloat((executionTimeMs / 1000).toFixed(3)),
    };
  }

  private formatDateToYYYYMMDD(date: Date): string {
    const y = date.getFullYear();
    const m = ('0' + (date.getMonth() + 1)).slice(-2);
    const d = ('0' + date.getDate()).slice(-2);
    return `${y}-${m}-${d}`;
  }

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
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  }

  private async initializeProblem(input: AlgorithmInput): Promise<void> {
    // 1. Khởi tạo studentsByExamGroup và examGroupsById
    this.studentsByExamGroup = new Map<string, string[]>();
    this.examGroupsById = new Map<number, any>();

    // 1a. Build studentsByExamGroup - sửa lỗi: dùng examGroup code làm key
    for (const seg of input.studentExamGroups) {
      const studentId = String(seg.studentId);
      for (const eg of seg.examGroups) {
        const examGroupCode = eg.code;
        if (!this.studentsByExamGroup.has(examGroupCode)) {
          this.studentsByExamGroup.set(examGroupCode, []);
        }
        this.studentsByExamGroup.get(examGroupCode)!.push(studentId);
      }
    }

    // 1b. Build examGroupsById - sửa lỗi: dùng id làm key nhưng lưu thêm code để mapping
    for (const g of input.examGroups) {
      const studentCount = this.studentsByExamGroup.get(g.code)?.length ?? 0;
      this.examGroupsById.set(g.id, {
        examGroupId: g.id,
        examGroupCode: g.code, // Lưu thêm code để mapping với studentsByExamGroup
        courseCode: g.courseCode,
        duration: g.duration_course_exam,
        expectedStudentCount: g.expectedStudentCount,
        studentCount,
      });
    }

    // 2. Rooms & Proctors
    this.rooms = input.rooms.map((r) => ({
      roomId: r.id,
      code: r.code,
      location: r.location,
      capacity: r.capacity,
    }));

    this.proctors = input.lecturers.map((l) => ({
      proctorId: l.id,
      code: l.code,
    }));

    // 3. Parse constraints
    this.constraints = this.parseConstraints(input.constraints);

    // 4. Lấy danh sách Exam từ DB
    const exams = await this.em.find(Exam, {}, { populate: ['examSlot'] });

    this.timeSlots = exams.map((exam) => {
      const startMinutes = this.convertHHMMtoMinutes(exam.examSlot.startTime);
      const endMinutes = this.convertHHMMtoMinutes(exam.examSlot.endTime);

      return {
        id: exam.id,
        date: exam.examDate,
        start: startMinutes,
        end: endMinutes,
      } as TimeSlot;
    });

    // 5. Tạo các map lookup
    this.roomsById = new Map<number, any>(this.rooms.map((r) => [r.roomId, r]));
    this.proctorsById = new Map<number, any>(
      this.proctors.map((p) => [p.proctorId, p]),
    );
    this.timeSlotsById = new Map<number, TimeSlot>(
      this.timeSlots.map((ts) => [ts.id, ts]),
    );
  }

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
    const roomSchedule = new Map<string, boolean>();
    const proctorSchedule = new Map<string, boolean>();
    const studentSchedule = new Map<string, boolean>();

    // Sắp xếp các nhóm thi theo số lượng sinh viên giảm dần
    const allExamGroups = Array.from(this.examGroupsById.values());
    allExamGroups.sort((a, b) => b.studentCount - a.studentCount);
    const sortedExamGroupIds = allExamGroups.map((g) => g.examGroupId);

    const shuffledTimeSlots = this.shuffleArray(this.timeSlots);
    const shuffledRooms = this.shuffleArray(this.rooms);
    const shuffledProctors = this.shuffleArray(this.proctors);

    for (const examGroupId of sortedExamGroupIds) {
      const examGroup = this.examGroupsById.get(examGroupId)!;
      // Sửa lỗi: lấy students bằng examGroupCode thay vì id
      const students =
        this.studentsByExamGroup.get(examGroup.examGroupCode) || [];
      let isAssigned = false;

      for (const timeSlot of shuffledTimeSlots) {
        let studentConflict = false;
        for (const studentId of students) {
          const studentKey = `${studentId}-${timeSlot.id}`;
          if (studentSchedule.has(studentKey)) {
            studentConflict = true;
            break;
          }
        }
        if (studentConflict) continue;

        for (const room of shuffledRooms) {
          if (examGroup.studentCount > room.capacity) {
            continue;
          }
          const roomKey = `${room.roomId}-${timeSlot.id}`;
          if (roomSchedule.has(roomKey)) {
            continue;
          }

          for (const proctor of shuffledProctors) {
            const proctorKey = `${proctor.proctorId}-${timeSlot.id}`;
            if (proctorSchedule.has(proctorKey)) {
              continue;
            }

            const gene: Gene = {
              examGroupId,
              roomId: room.roomId,
              timeSlotId: timeSlot.id,
              proctorId: proctor.proctorId,
            };
            chromosome.push(gene);

            roomSchedule.set(roomKey, true);
            proctorSchedule.set(proctorKey, true);
            students.forEach((studentId) => {
              const studentKey = `${studentId}-${timeSlot.id}`;
              studentSchedule.set(studentKey, true);
            });

            isAssigned = true;
            break;
          }
          if (isAssigned) break;
        }
        if (isAssigned) break;
      }

      if (!isAssigned) {
        const gene: Gene = {
          examGroupId,
          roomId: shuffledRooms[0].roomId,
          timeSlotId: shuffledTimeSlots[0].id,
          proctorId: shuffledProctors[0].proctorId,
        };
        chromosome.push(gene);
      }
    }

    chromosome.sort((a, b) => a.examGroupId - b.examGroupId);
    return chromosome;
  }

  private calculateFitness(chromosome: Chromosome): number {
    let hardConflicts = 0;
    let softConflicts = 0;

    const roomSchedule = new Map<string, Gene[]>();
    const proctorSchedule = new Map<string, Gene[]>();
    const studentSchedule = new Map<string, Gene[]>();
    const studentDailySchedule = new Map<string, Gene[]>();
    const studentLocationSchedule = new Map<string, string[]>();

    for (const gene of chromosome) {
      const room = this.roomsById.get(gene.roomId)!;
      const examGroup = this.examGroupsById.get(gene.examGroupId)!;
      // Sửa lỗi: lấy students bằng examGroupCode
      const students =
        this.studentsByExamGroup.get(examGroup.examGroupCode) || [];
      const timeSlot = this.timeSlotsById.get(gene.timeSlotId)!;

      if (examGroup.studentCount > room.capacity) {
        hardConflicts++;
      }

      const roomKey = `${gene.roomId}-${gene.timeSlotId}`;
      const proctorKey = `${gene.proctorId}-${gene.timeSlotId}`;

      if (!roomSchedule.has(roomKey)) roomSchedule.set(roomKey, []);
      roomSchedule.get(roomKey)!.push(gene);

      if (!proctorSchedule.has(proctorKey)) proctorSchedule.set(proctorKey, []);
      proctorSchedule.get(proctorKey)!.push(gene);

      const dateKey = timeSlot.date.toDateString();

      students.forEach((studentId) => {
        const studentKey = `${studentId}-${gene.timeSlotId}`;
        if (!studentSchedule.has(studentKey))
          studentSchedule.set(studentKey, []);
        studentSchedule.get(studentKey)!.push(gene);

        const studentDayKey = `${studentId}-${dateKey}`;
        if (!studentDailySchedule.has(studentDayKey))
          studentDailySchedule.set(studentDayKey, []);
        studentDailySchedule.get(studentDayKey)!.push(gene);

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

  private mutate(chromosome: Chromosome): Chromosome {
    const geneToMutateIndex = Math.floor(Math.random() * chromosome.length);
    const gene = { ...chromosome[geneToMutateIndex] };
    const examGroup = this.examGroupsById.get(gene.examGroupId)!;

    const mutationType = Math.floor(Math.random() * 3);
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    switch (mutationType) {
      case 0: {
        let newTimeSlotId: number;
        let isConflict = true;
        attempts = 0;

        while (isConflict && attempts < MAX_ATTEMPTS) {
          attempts++;
          newTimeSlotId =
            this.timeSlots[Math.floor(Math.random() * this.timeSlots.length)]
              .id;
          if (newTimeSlotId === gene.timeSlotId) continue;

          gene.timeSlotId = newTimeSlotId;
          isConflict = this.checkGeneConflict(
            chromosome,
            gene,
            geneToMutateIndex,
          );
        }

        if (!isConflict) {
          chromosome[geneToMutateIndex] = gene;
        }
        break;
      }

      case 1: {
        let newRoomId: number;
        let isConflict = true;
        attempts = 0;

        while (isConflict && attempts < MAX_ATTEMPTS) {
          attempts++;
          const newRoom =
            this.rooms[Math.floor(Math.random() * this.rooms.length)];
          if (newRoom.roomId === gene.roomId) continue;

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
          chromosome[geneToMutateIndex] = gene;
        }
        break;
      }

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
          chromosome[geneToMutateIndex] = gene;
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
    const examGroup = this.examGroupsById.get(mutatedGene.examGroupId)!;
    // Sửa lỗi: lấy students bằng examGroupCode
    const students =
      this.studentsByExamGroup.get(examGroup.examGroupCode) || [];

    for (let i = 0; i < chromosome.length; i++) {
      if (i === mutatedGeneIndex) continue;

      const otherGene = chromosome[i];

      if (otherGene.timeSlotId !== mutatedGene.timeSlotId) {
        continue;
      }

      if (otherGene.roomId === mutatedGene.roomId) {
        return true;
      }

      if (otherGene.proctorId === mutatedGene.proctorId) {
        return true;
      }

      const otherExamGroup = this.examGroupsById.get(otherGene.examGroupId)!;
      const otherStudents =
        this.studentsByExamGroup.get(otherExamGroup.examGroupCode) || [];

      if (students.some((s) => otherStudents.includes(s))) {
        return true;
      }
    }

    return false;
  }

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
    const timetableMap = new Map<string, TimetableDay>();

    chromosome.forEach((gene) => {
      const timeSlot = this.timeSlotsById.get(gene.timeSlotId)!;
      const examGroup = this.examGroupsById.get(gene.examGroupId)!;
      const room = this.roomsById.get(gene.roomId)!;
      // Sửa lỗi: lấy studentCount bằng examGroupCode
      const studentCount =
        this.studentsByExamGroup.get(examGroup.examGroupCode)?.length || 0;

      const dateKey = this.formatDateToYYYYMMDD(timeSlot.date);
      const dayName = this.getDayOfWeekName(timeSlot.date.getDay());

      if (!timetableMap.has(dateKey)) {
        timetableMap.set(dateKey, {
          day: dayName,
          date: dateKey,
          morning: [],
          afternoon: [],
        });
      }

      const daySchedule = timetableMap.get(dateKey)!;
      const sessionKey = timeSlot.start < 12 * 60 ? 'morning' : 'afternoon';

      const startTime = `${Math.floor(timeSlot.start / 60)}:${('0' + (timeSlot.start % 60)).slice(-2)}`;
      const endTimeMinutes = timeSlot.start + examGroup.duration;
      const endTime = `${Math.floor(endTimeMinutes / 60)}:${('0' + (endTimeMinutes % 60)).slice(-2)}`;

      const examEvent: SimplifiedExamEvent = {
        time: `${startTime} - ${endTime}`,
        date: dateKey,
        dayOfWeek: dayName,
        examGroup: examGroup.examGroupCode, // Sử dụng code thay vì id
        courseCode: examGroup.courseCode,
        duration: examGroup.duration,
        roomId: room.roomId,
        location: room.location,
        proctor: gene.proctorId,
        studentCount: studentCount,
      };

      daySchedule[sessionKey].push(examEvent);
    });

    const timetable: TimetableDay[] = Array.from(timetableMap.values()).sort(
      (a, b) => a.date.localeCompare(b.date),
    );

    timetable.forEach((day) => {
      day.morning.sort((a, b) => a.time.localeCompare(b.time));
      day.afternoon.sort((a, b) => a.time.localeCompare(b.time));
    });

    return {
      fitness,
      isOptimal: fitness === 0,
      timetable: timetable,
    };
  }

  private parseConstraints(constraints: AlgorithmInput['constraints']): any {
    const parsed: any = {};
    constraints.forEach((c) => {
      if (!c.isActive) return;
      switch (c.code) {
        case 'HOLIDAY':
          parsed.holidays = c.rule.holidays || [];
          break;
        case 'AVOID_WEEKEND':
          parsed.avoidWeekend = c.rule.avoidWeekend;
          break;
        case 'MAX_EXAMS_PER_DAY':
          parsed.maxExamsPerStudentPerDay = c.rule.maxExamsPerStudentPerDay;
          break;
        case 'AVOID_INTER_LOCATION_TRAVEL':
          parsed.avoidInterLocationTravel = c.rule.avoidInterLocationTravel;
          break;
        default:
          console.warn(`Constraint ${c.code} chưa được parse`);
      }
    });
    return parsed;
  }

  private convertHHMMtoMinutes(time: string): number {
    const [hh, mm] = time.split(':').map(Number);
    return hh * 60 + mm;
  }
}
