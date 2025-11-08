import { Injectable } from '@nestjs/common';
import {
  Chromosome,
  Gene,
  SchedulingProblem,
  GaExamGroup,
  GaRoom,
  GaProctor,
  GaTimeSlot,
} from './scheduling.domain';
import {
  POPULATION_SIZE,
  MUTATION_RATE,
  TOURNAMENT_SIZE,
  ELITISM_COUNT,
  HARD_CONSTRAINT_PENALTY,
  SOFT_CONSTRAINT_PENALTY,
  MAX_MUTATION_ATTEMPTS,
} from './scheduling.config';
import { shuffleArray } from './scheduling.utils';

@Injectable()
export class GeneticAlgorithmService {
  private problem!: SchedulingProblem;
  private examGroupsById!: Map<number, GaExamGroup>;
  private roomsById!: Map<number, GaRoom>;
  private proctorsById!: Map<number, GaProctor>;
  private timeSlotsById!: Map<number, GaTimeSlot>;

  public run(problem: SchedulingProblem): Chromosome | null {
    this.problem = problem;

    if (this.problem.timeSlots.length === 0) {
      throw new Error('Không có kíp thi hợp lệ để xếp lịch.');
    }

    // Tạo các Map để tra cứu nhanh
    this.examGroupsById = new Map(
      this.problem.examGroups.map((eg) => [eg.examGroupId, eg]),
    );
    this.roomsById = new Map(this.problem.rooms.map((r) => [r.roomId, r]));
    this.proctorsById = new Map(
      this.problem.proctors.map((p) => [p.proctorId, p]),
    );
    this.timeSlotsById = new Map(
      this.problem.timeSlots.map((ts) => [ts.id, ts]),
    );

    let population = this.initializePopulation();
    let bestSchedule: Chromosome | null = null;
    let bestFitness = Infinity;

    for (let gen = 0; gen < POPULATION_SIZE; gen++) {
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

      population = this.createNewGeneration(populationWithFitness);
    }
    return bestSchedule;
  }

  private initializePopulation(): Chromosome[] {
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

    const allExamGroups = [...this.problem.examGroups];
    allExamGroups.sort((a, b) => b.studentCount - a.studentCount);
    const sortedExamGroupIds = allExamGroups.map((g) => g.examGroupId);

    const shuffledTimeSlots = shuffleArray(this.problem.timeSlots);
    const shuffledRooms = shuffleArray(this.problem.rooms);
    const shuffledProctors = shuffleArray(this.problem.proctors);

    for (const examGroupId of sortedExamGroupIds) {
      const examGroup = this.examGroupsById.get(examGroupId)!;
      const students = this.problem.studentsByExamGroup.get(examGroupId)!;
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
          if (examGroup.studentCount > room.capacity) continue;
          const roomKey = `${room.roomId}-${timeSlot.id}`;
          if (roomSchedule.has(roomKey)) continue;

          for (const proctor of shuffledProctors) {
            const proctorKey = `${proctor.proctorId}-${timeSlot.id}`;
            if (proctorSchedule.has(proctorKey)) continue;

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
              studentSchedule.set(`${studentId}-${timeSlot.id}`, true);
            });

            isAssigned = true;
            break;
          }
          if (isAssigned) break;
        }
        if (isAssigned) break;
      }

      if (!isAssigned) {
        // Fallback ngẫu nhiên
        chromosome.push({
          examGroupId,
          roomId: shuffledRooms[0].roomId,
          timeSlotId: shuffledTimeSlots[0].id,
          proctorId: shuffledProctors[0].proctorId,
        });
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
    const studentLocationSchedule = new Map<string, number[]>();
    const studentExamSlots = new Map<number, GaTimeSlot[]>();

    for (const gene of chromosome) {
      const room = this.roomsById.get(gene.roomId)!;
      const examGroup = this.examGroupsById.get(gene.examGroupId)!;
      const students = this.problem.studentsByExamGroup.get(gene.examGroupId)!;
      const timeSlot = this.timeSlotsById.get(gene.timeSlotId)!;

      // 1️⃣ HARD: Sức chứa phòng
      if (examGroup.studentCount > room.capacity) {
        hardConflicts++;
      }

      // 2️⃣ HARD: Trùng lịch phòng, giám thị, sinh viên
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

        // 3️⃣ Ghi nhận cơ sở thi mỗi ngày của sinh viên
        if (!studentLocationSchedule.has(studentDayKey))
          studentLocationSchedule.set(studentDayKey, []);
        if (
          !studentLocationSchedule.get(studentDayKey)!.includes(room.locationId)
        ) {
          studentLocationSchedule.get(studentDayKey)!.push(room.locationId);
        }

        if (!studentExamSlots.has(studentId))
          studentExamSlots.set(studentId, []);
        studentExamSlots.get(studentId)!.push(timeSlot);
      });

      // 4️⃣ HARD: HOLIDAY — không thi vào các ngày nghỉ
      const holidayList = this.problem.constraints.holiday;
      if (
        holidayList &&
        holidayList.some(
          (holiday) => timeSlot.date.toISOString().split('T')[0] === holiday,
        )
      ) {
        hardConflicts++;
      }

      // 5️⃣ HARD: AVOID_WEEKEND — không thi cuối tuần
      if (this.problem.constraints.avoid_weekend) {
        const dayOfWeek = timeSlot.date.getDay(); // 0=CN
        if (dayOfWeek === 0) {
          hardConflicts++;
        }
      }
    }

    // 6️⃣ HARD: trùng phòng/giám thị/sinh viên
    roomSchedule.forEach((v) => {
      if (v.length > 1) hardConflicts += v.length - 1;
    });
    proctorSchedule.forEach((v) => {
      if (v.length > 1) hardConflicts += v.length - 1;
    });
    studentSchedule.forEach((v) => {
      if (v.length > 1) hardConflicts += v.length - 1;
    });

    // 7️⃣ SOFT: MAX_EXAMS_PER_DAY
    if (this.problem.constraints.max_exam_per_day) {
      studentDailySchedule.forEach((v) => {
        if (v.length > this.problem.constraints.max_exam_per_day!) {
          softConflicts += SOFT_CONSTRAINT_PENALTY.STUDENT_EXAMS_PER_DAY;
        }
      });
    }

    // 8️⃣ SOFT: MAX_LOCATION_PER_DAY
    if (this.problem.constraints.max_location) {
      studentLocationSchedule.forEach((v) => {
        if (v.length > this.problem.constraints.max_location!) {
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
      child.push(Math.random() < 0.5 ? parent1[i] : parent2[i]);
    }
    return child;
  }

  private mutate(chromosome: Chromosome): Chromosome {
    const geneToMutateIndex = Math.floor(Math.random() * chromosome.length);
    const gene = { ...chromosome[geneToMutateIndex] };
    const examGroup = this.examGroupsById.get(gene.examGroupId)!;

    const mutationType = Math.floor(Math.random() * 3);
    let attempts = 0;

    switch (mutationType) {
      case 0: {
        // Đột biến Kíp thi
        let newTimeSlotId: number;
        let isConflict = true;
        attempts = 0;
        while (isConflict && attempts < MAX_MUTATION_ATTEMPTS) {
          attempts++;
          newTimeSlotId =
            this.problem.timeSlots[
              Math.floor(Math.random() * this.problem.timeSlots.length)
            ].id;
          if (newTimeSlotId === gene.timeSlotId) continue;
          gene.timeSlotId = newTimeSlotId;
          isConflict = this.checkGeneConflict(
            chromosome,
            gene,
            geneToMutateIndex,
          );
        }
        if (!isConflict) chromosome[geneToMutateIndex] = gene;
        break;
      }
      case 1: {
        // Đột biến Phòng
        let newRoomId: number;
        let isConflict = true;
        attempts = 0;
        while (isConflict && attempts < MAX_MUTATION_ATTEMPTS) {
          attempts++;
          const newRoom =
            this.problem.rooms[
              Math.floor(Math.random() * this.problem.rooms.length)
            ];
          if (newRoom.roomId === gene.roomId) continue;
          if (examGroup.studentCount > newRoom.capacity) continue;
          gene.roomId = newRoom.roomId;
          isConflict = this.checkGeneConflict(
            chromosome,
            gene,
            geneToMutateIndex,
          );
        }
        if (!isConflict) chromosome[geneToMutateIndex] = gene;
        break;
      }
      case 2: {
        // Đột biến Giám thị
        let newProctorId: number;
        let isConflict = true;
        attempts = 0;
        while (isConflict && attempts < MAX_MUTATION_ATTEMPTS) {
          attempts++;
          newProctorId =
            this.problem.proctors[
              Math.floor(Math.random() * this.problem.proctors.length)
            ].proctorId;
          if (newProctorId === gene.proctorId) continue;
          gene.proctorId = newProctorId;
          isConflict = this.checkGeneConflict(
            chromosome,
            gene,
            geneToMutateIndex,
          );
        }
        if (!isConflict) chromosome[geneToMutateIndex] = gene;
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
    const students = this.problem.studentsByExamGroup.get(
      mutatedGene.examGroupId,
    )!;
    for (let i = 0; i < chromosome.length; i++) {
      if (i === mutatedGeneIndex) continue;
      const otherGene = chromosome[i];
      if (otherGene.timeSlotId !== mutatedGene.timeSlotId) continue;
      if (otherGene.roomId === mutatedGene.roomId) return true;
      if (otherGene.proctorId === mutatedGene.proctorId) return true;
      const otherStudents = this.problem.studentsByExamGroup.get(
        otherGene.examGroupId,
      )!;
      if (students.some((s) => otherStudents.includes(s))) return true;
    }
    return false;
  }
}
