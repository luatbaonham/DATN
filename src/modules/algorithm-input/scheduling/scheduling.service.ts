import { Injectable } from '@nestjs/common';
import { AdvancedScheduleDto } from './dto/advanced-schedule.dto';
import {
  RoomDto,
  SubjectDto,
  ProctorDto,
  ConstraintsDto,
} from './dto/advanced-schedule.dto';

// --- Định nghĩa cấu trúc dữ liệu cho thuật toán ---
type Gene = {
  subjectId: string;
  roomId: string;
  timeSlotId: number;
  proctorId: string;
};
type Chromosome = Gene[];

// Định nghĩa kíp thi
type TimeSlot = {
  id: number;
  day: number;
  start: number; // số phút từ 00:00
  end: number; // số phút từ 00:00
};

// --- Hằng số cho thuật toán di truyền ---
const POPULATION_SIZE = 100;
const GENERATIONS = 200;
const MUTATION_RATE = 0.1;
const TOURNAMENT_SIZE = 5;
const ELITISM_COUNT = 2; // Giữ lại 2 cá thể tốt nhất

// Trọng số cho các vi phạm ràng buộc
const HARD_CONSTRAINT_PENALTY = 1000;
const SOFT_CONSTRAINT_PENALTY = {
  STUDENT_EXAMS_PER_DAY: 10,
  INTER_LOCATION_TRAVEL: 5,
};

@Injectable()
export class SchedulingService {
  // --- Biến lưu trữ dữ liệu đầu vào đã được xử lý ---
  private studentsBySubject!: Map<string, string[]>;
  private subjectsById!: Map<string, SubjectDto>;
  private rooms!: RoomDto[];
  private proctors!: ProctorDto[];
  private constraints!: ConstraintsDto;
  private timeSlots!: TimeSlot[];

  // --- Hàm chính để chạy thuật toán ---
  public generateAdvanced(dto: AdvancedScheduleDto) {
    this.initializeProblem(dto);

    let population = this.initializePopulation();
    let bestSchedule: Chromosome | null = null;

    for (let gen = 0; gen < GENERATIONS; gen++) {
      const populationWithFitness = population.map((chromosome) => ({
        chromosome,
        fitness: this.calculateFitness(chromosome),
      }));

      populationWithFitness.sort((a, b) => a.fitness - b.fitness);

      if (
        !bestSchedule ||
        populationWithFitness[0].fitness < this.calculateFitness(bestSchedule)
      ) {
        bestSchedule = populationWithFitness[0].chromosome;
      }

      if (populationWithFitness[0].fitness === 0) {
        console.log(`Found perfect solution at generation ${gen}`);
        break; // Dừng sớm nếu tìm thấy giải pháp hoàn hảo
      }

      const newPopulation = this.createNewGeneration(populationWithFitness);
      population = newPopulation;
    }

    return this.formatOutput(bestSchedule);
  }

  // --- Các bước của Thuật toán Di truyền ---

  private initializeProblem(dto: AdvancedScheduleDto): void {
    // 1. Xử lý sinh viên và môn học
    this.studentsBySubject = new Map();
    this.subjectsById = new Map(dto.subjects.map((s) => [s.subjectId, s]));
    dto.students.forEach((student) => {
      student.subjects.forEach((subjectId) => {
        if (!this.studentsBySubject.has(subjectId)) {
          this.studentsBySubject.set(subjectId, []);
        }
        this.studentsBySubject.get(subjectId)!.push(student.studentId);
      });
    });

    // 2. Lưu trữ phòng, giám thị, và ràng buộc
    this.rooms = dto.rooms;
    this.proctors = dto.proctors;
    this.constraints = dto.constraints ?? {};

    // 3. Tạo các kíp thi (Time Slots)
    // Giả sử thi trong 5 ngày, 2 ca sáng (8h, 10h), 2 ca chiều (14h, 16h)
    this.timeSlots = [];
    let id = 0;
    for (let day = 1; day <= 5; day++) {
      for (const startHour of [8, 10, 14, 16]) {
        this.timeSlots.push({
          id: id++,
          day: day,
          start: startHour * 60,
          end: 0, // Sẽ được cập nhật sau khi gán môn thi
        });
      }
    }
  }

  private initializePopulation(): Chromosome[] {
    const population: Chromosome[] = [];
    const subjectIds = Array.from(this.subjectsById.keys());

    for (let i = 0; i < POPULATION_SIZE; i++) {
      const chromosome: Chromosome = subjectIds.map((subjectId) => ({
        subjectId,
        roomId:
          this.rooms[Math.floor(Math.random() * this.rooms.length)].roomId,
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

  private calculateFitness(chromosome: Chromosome): number {
    let hardConflicts = 0;
    let softConflicts = 0;

    const roomSchedule = new Map<string, Gene[]>(); // key: "roomId-timeSlotId"
    const proctorSchedule = new Map<string, Gene[]>(); // key: "proctorId-timeSlotId"
    const studentSchedule = new Map<string, Gene[]>(); // key: "studentId-timeSlotId"
    const studentDailySchedule = new Map<string, Gene[]>(); // key: "studentId-day"
    const studentLocationSchedule = new Map<string, string[]>(); // key: "studentId-day" -> [location1, location2]

    for (const gene of chromosome) {
      const room = this.rooms.find((r) => r.roomId === gene.roomId)!;
      const subject = this.subjectsById.get(gene.subjectId)!;
      const students = this.studentsBySubject.get(gene.subjectId)!;
      const timeSlot = this.timeSlots.find((ts) => ts.id === gene.timeSlotId)!;

      // Ràng buộc cứng 4: Sức chứa phòng
      if (students.length > room.capacity) {
        hardConflicts++;
      }

      // Kiểm tra trùng lịch phòng, giám thị, sinh viên
      const roomKey = `${gene.roomId}-${gene.timeSlotId}`;
      const proctorKey = `${gene.proctorId}-${gene.timeSlotId}`;

      if (!roomSchedule.has(roomKey)) roomSchedule.set(roomKey, []);
      roomSchedule.get(roomKey)!.push(gene);

      if (!proctorSchedule.has(proctorKey)) proctorSchedule.set(proctorKey, []);
      proctorSchedule.get(proctorKey)!.push(gene);

      students.forEach((studentId) => {
        const studentKey = `${studentId}-${gene.timeSlotId}`;
        if (!studentSchedule.has(studentKey))
          studentSchedule.set(studentKey, []);
        studentSchedule.get(studentKey)!.push(gene);

        const studentDayKey = `${studentId}-${timeSlot.day}`;
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

    // Ràng buộc cứng 1, 2, 3:
    roomSchedule.forEach((v) => {
      if (v.length > 1) hardConflicts += v.length - 1;
    });
    proctorSchedule.forEach((v) => {
      if (v.length > 1) hardConflicts += v.length - 1;
    });
    studentSchedule.forEach((v) => {
      if (v.length > 1) hardConflicts += v.length - 1;
    });

    // Ràng buộc mềm 1: Số ca thi/ngày/sinh viên
    if (this.constraints.maxExamsPerStudentPerDay) {
      studentDailySchedule.forEach((v) => {
        if (v.length > this.constraints.maxExamsPerStudentPerDay!) {
          softConflicts += SOFT_CONSTRAINT_PENALTY.STUDENT_EXAMS_PER_DAY;
        }
      });
    }

    // Ràng buộc mềm 2: Di chuyển giữa các địa điểm
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

    // Elitism: Giữ lại những cá thể tốt nhất
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
    const mutationType = Math.floor(Math.random() * 3); // 0: room, 1: timeSlot, 2: proctor

    switch (mutationType) {
      case 0:
        chromosome[geneToMutateIndex].roomId =
          this.rooms[Math.floor(Math.random() * this.rooms.length)].roomId;
        break;
      case 1:
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

  private formatOutput(chromosome: Chromosome | null) {
    if (!chromosome) {
      return { error: 'Không thể tạo lịch thi.' };
    }

    const fitness = this.calculateFitness(chromosome);
    const scheduleByDay = {};

    chromosome.forEach((gene) => {
      const timeSlot = this.timeSlots.find((ts) => ts.id === gene.timeSlotId)!;
      const subject = this.subjectsById.get(gene.subjectId)!;
      const room = this.rooms.find((r) => r.roomId === gene.roomId)!;
      const students = this.studentsBySubject.get(gene.subjectId)!;

      const dayKey = `Ngày ${timeSlot.day}`;
      if (!scheduleByDay[dayKey]) {
        scheduleByDay[dayKey] = [];
      }

      const startTime = `${Math.floor(timeSlot.start / 60)}:${('0' + (timeSlot.start % 60)).slice(-2)}`;
      const endTimeMinutes = timeSlot.start + subject.duration;
      const endTime = `${Math.floor(endTimeMinutes / 60)}:${('0' + (endTimeMinutes % 60)).slice(-2)}`;

      scheduleByDay[dayKey].push({
        time: `${startTime} - ${endTime}`,
        subject: gene.subjectId,
        duration: subject.duration,
        room: gene.roomId,
        location: room.location,
        proctor: gene.proctorId,
        studentCount: students.length,
        students: students,
      });
    });

    // Sắp xếp các ca thi trong ngày theo thời gian bắt đầu
    Object.keys(scheduleByDay).forEach((dayKey) => {
      scheduleByDay[dayKey].sort((a, b) => a.time.localeCompare(b.time));
    });

    return {
      fitness,
      isOptimal: fitness === 0,
      schedule: scheduleByDay,
    };
  }
}
