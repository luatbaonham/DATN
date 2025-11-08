import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { ScheduleRequestDto } from './dto/schedule-request.dto';

// Import Entities
import { Room } from '@modules/algorithm-input/room/entities/room.entity';
import { Lecturer } from '@modules/core-data/lecturer/entities/lecturer.entity';
import { ExamGroup } from '@modules/algorithm-input/exam-group/entities/exam-group.entity';
import { StudentExamGroup } from '@modules/algorithm-input/student-exam-group/entities/student-exam-group.entity';
import { Exam } from '@modules/result/exam/entities/exam.entity';
import { ExamRegistration } from '@modules/result/exam-registration/entities/exam-registration.entity';
import { ExamSupervisor } from '@modules/result/exam-supervisor/entities/exam-supervisor.entity';
import { Student } from '@modules/core-data/students/entities/student.entity';
import { ExamSlot } from '@modules/result/exam-slot/entities/exam-slot.entity';
import { ConstraintValidator } from '../../algorithm-input/scheduling/constraint-schema/constraint-validator';

// Import Dịch vụ và Tiện ích mới
import { GeneticAlgorithmService } from './genetic-algorithm.service';
import {
  SchedulingProblem,
  GaRoom,
  GaProctor,
  GaExamGroup,
  GaTimeSlot,
  Chromosome,
  TimetableDay,
  SimplifiedExamEvent,
} from './scheduling.domain';
import { DAILY_START_HOURS } from './scheduling.config';
import { formatDateToYYYYMMDD, getDayOfWeekName } from './scheduling.utils';
import { ExamGroupingService } from './exam-grouping.service';
import { Constraint } from '@modules/constraints/entities/constraint.entity';
import { AdvancedConstraintsDto } from './dto/advanced-schedule.dto';

@Injectable()
export class SchedulingService {
  // Dữ liệu đã chuẩn bị cho thuật toán
  private studentsByExamGroup!: Map<number, number[]>;
  private problem!: SchedulingProblem; // <-- Dữ liệu được đóng gói

  constructor(
    private readonly em: EntityManager,
    private readonly gaService: GeneticAlgorithmService, // <-- Inject service mới
    private readonly examGroupingService: ExamGroupingService,
    @InjectRepository(Exam)
    private readonly examRepository: EntityRepository<Exam>,
    @InjectRepository(ExamRegistration)
    private readonly examRegistrationRepository: EntityRepository<ExamRegistration>,
    @InjectRepository(ExamSupervisor)
    private readonly examSupervisorRepository: EntityRepository<ExamSupervisor>,
  ) {}

  public async generateAdvanced(dto: ScheduleRequestDto) {
    const startTime = Date.now();
    let loopGeneration = 0; // Tạm thời (GA service nên trả về)

    try {
      // 1. Chuẩn bị dữ liệu
      await this.initializeProblem(dto);

      if (this.problem.timeSlots.length === 0) {
        return {
          fitness: Infinity,
          isOptimal: false,
          error: 'Không có ngày thi hợp lệ trong khoảng đã chọn.',
          timetable: [],
          executionTimeMs: 0,
        };
      }

      // 2. Chạy thuật toán
      // (GA service sẽ xử lý các hằng số GENERATIONS)
      const bestSchedule = this.gaService.run(this.problem, loopGeneration);
      const endTime = Date.now();
      const executionTimeMs = endTime - startTime;

      if (!bestSchedule) {
        // ... xử lý lỗi không tìm thấy lịch ...
        throw new InternalServerErrorException('Không thể tạo lịch thi.');
      }

      // 3. Lưu vào Database
      await this.saveScheduleToDb(bestSchedule, dto.examSessionId);

      // 4. Định dạng và Trả về
      const result = this.formatOutput(bestSchedule);

      return {
        ...result,
        loopGeneration: loopGeneration, // Cần cải thiện
        executionTimeMs: executionTimeMs,
        executionTimeSeconds: parseFloat((executionTimeMs / 1000).toFixed(3)),
      };
    } catch (error) {
      console.error('LỖI trong quá trình xếp lịch:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Lỗi khi xếp lịch: ${message}`);
    }
  }

  // --- CÁC HÀM PRIVATE CỦA SERVICE ĐIỀU PHỐI ---

  /**
   * 1. Chuẩn bị dữ liệu
   */
  private async initializeProblem(dto: ScheduleRequestDto): Promise<void> {
    // --- Chuyển đổi constraint FE sang GA ---
    let advancedConstraints: AdvancedConstraintsDto = {};

    if (dto.constraints?.length) {
      for (const c of dto.constraints) {
        const { constraintCode, rule } = c;

        const validation = ConstraintValidator.validateRule(
          constraintCode,
          rule,
        );
        if (!validation.valid) {
          throw new BadRequestException({
            message: `Rule của constraint ${constraintCode} không hợp lệ`,
            errors: validation.errors,
          });
        }

        // ✅ Gán vào advancedConstraints
        switch (constraintCode) {
          case 'HOLIDAY':
            advancedConstraints.holiday = rule.holiday ?? [];
            break;
          case 'AVOID_WEEKEND':
            advancedConstraints.avoid_weekend = rule.avoid_weekend ?? false;
            break;
          case 'MAX_EXAMS_PER_DAY':
            advancedConstraints.max_exam_per_day = rule.max_exam_per_day ?? 1;
            break;
          case 'ROOM_LOCATION_LIMIT':
            advancedConstraints.max_location = rule.max_location ?? 1;
            break;
          default:
            break;
        }
      }
    }

    this.studentsByExamGroup = new Map();
    const examSlotEntities = await this.em.find(ExamSlot, {});
    if (examSlotEntities.length === 0) {
      throw new Error('Không có ca thi (ExamSlot) nào trong CSDL.');
    }
    // ds nhóm thi với sinh viên thuộc nhóm thi tự động tạo
    const { examGroups, studentsByExamGroup } =
      await this.examGroupingService.generateExamGroups(
        dto.examSessionId,
        dto.rooms,
      );
    // gán ngay với cái phía trên trả về
    this.studentsByExamGroup = studentsByExamGroup;
    // --- 2️⃣ Không còn truy vấn phòng/giảng viên nữa ---
    // FE gửi đủ thông tin → chỉ cần map sang đối tượng GA
    const rooms: GaRoom[] = dto.rooms.map((r) => ({
      roomId: r.id,
      capacity: r.capacity,
      locationId: r.locationId,
    }));

    const proctors: GaProctor[] = dto.lecturers.map((l) => ({
      proctorId: l.id,
      name: l.name, // Có thể thêm nếu bạn muốn hiển thị trong kết quả
    }));

    const gaExamGroups: GaExamGroup[] = examGroups.map((eg) => {
      const studentCount = studentsByExamGroup.get(eg.examGroupId)?.length || 0;
      return {
        examGroupId: eg.examGroupId,
        courseId: eg.courseId,
        duration: eg.duration,
        studentCount,
      };
    });

    // Tạo TimeSlots
    const timeSlots = this.createTimeSlots(
      dto.startDate,
      dto.endDate,
      examSlotEntities,
    );

    // Đóng gói dữ liệu đầu vào
    this.problem = {
      examGroups: gaExamGroups,
      rooms,
      proctors,
      timeSlots,
      studentsByExamGroup: this.studentsByExamGroup,
      constraints: advancedConstraints,
    };
  }

  private createTimeSlots(
    startDate: string,
    endDate: string,
    examSlots: ExamSlot[],
  ): GaTimeSlot[] {
    const slots: GaTimeSlot[] = [];
    let id = 0;
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');

    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 0) continue; // Bỏ Chủ Nhật
      const dateString = formatDateToYYYYMMDD(d);

      for (const examSlot of examSlots) {
        // Chuyển "08:00" -> 480
        const [startHour, startMin] = examSlot.startTime.split(':').map(Number);
        const [endHour, endMin] = examSlot.endTime.split(':').map(Number);
        const startMinute = startHour * 60 + startMin;
        const endMinute = endHour * 60 + endMin;

        slots.push({
          id: id++, // ID của kíp (0, 1, 2...)
          date: new Date(d),
          examSlotId: examSlot.id, // <-- ID của ca (từ DB)
          start: startMinute,
          end: endMinute,
        });
      }
    }
    return slots;
  }

  /**
   * 3. Lưu Database
   */
  private async saveScheduleToDb(
    chromosome: Chromosome,
    examSessionId: number,
  ) {
    // Dùng Map để tra cứu nhanh (chỉ dùng trong hàm này)
    const examGroupsById = new Map(
      this.problem.examGroups.map((eg) => [eg.examGroupId, eg]),
    );
    const timeSlotsById = new Map(
      this.problem.timeSlots.map((ts) => [ts.id, ts]),
    );

    await this.em.transactional(async (em) => {
      // Xóa lịch cũ
      await this.deleteScheduleBySessionId(examSessionId);

      for (const gene of chromosome) {
        const examGroup = examGroupsById.get(gene.examGroupId)!;
        const timeSlot = timeSlotsById.get(gene.timeSlotId)!;
        const students = this.studentsByExamGroup.get(gene.examGroupId) || [];

        // Tạo Exam
        const exam = new Exam();
        exam.examGroup = em.getReference(ExamGroup, gene.examGroupId);
        exam.room = em.getReference(Room, gene.roomId);
        exam.examDate = timeSlot.date;
        exam.duration = examGroup.duration;
        exam.status = 'Draft';
        exam.examSlot = em.getReference(ExamSlot, timeSlot.examSlotId);
        await em.persist(exam);

        // Tạo Supervisor
        const supervisor = new ExamSupervisor();
        supervisor.exam = exam;
        supervisor.lecturer = em.getReference(Lecturer, gene.proctorId);
        await em.persist(supervisor);

        // Tạo Registrations
        const registrations: ExamRegistration[] = students.map((studentId) => {
          const reg = new ExamRegistration();
          reg.exam = exam;
          reg.student = em.getReference(Student, studentId);
          return reg;
        });
        await em.persist(registrations);
      }
    });
  }

  /**
   * 4. Định dạng đầu ra
   */
  private formatOutput(chromosome: Chromosome) {
    // (Hàm này cần tra cứu ngược, nên cần các Map)
    const examGroupsById = new Map(
      this.problem.examGroups.map((eg) => [eg.examGroupId, eg]),
    );
    const timeSlotsById = new Map(
      this.problem.timeSlots.map((ts) => [ts.id, ts]),
    );
    const roomsById = new Map(this.problem.rooms.map((r) => [r.roomId, r]));

    const fitness = 0; // Tạm thời (nên lấy từ GA service)
    const timetableMap = new Map<string, TimetableDay>();

    chromosome.forEach((gene) => {
      const timeSlot = timeSlotsById.get(gene.timeSlotId)!;
      const examGroup = examGroupsById.get(gene.examGroupId)!;
      const room = roomsById.get(gene.roomId)!;
      const studentCount = this.studentsByExamGroup.get(
        gene.examGroupId,
      )!.length;

      const dateKey = formatDateToYYYYMMDD(timeSlot.date);
      const dayName = getDayOfWeekName(timeSlot.date.getDay());

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
        examGroup: gene.examGroupId.toString(),
        courseId: examGroup.courseId,
        duration: examGroup.duration,
        roomId: gene.roomId.toString(),
        locationId: room.locationId,
        proctor: gene.proctorId.toString(),
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

  /**
   * API Xóa lịch
   */
  public async deleteScheduleBySessionId(sessionId: number): Promise<{
    deletedExams: number;
    deletedRegistrations: number;
    deletedSupervisors: number;
  }> {
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
    const regDeleteResult = await this.examRegistrationRepository.nativeDelete({
      exam: { $in: examIds },
    });
    const supDeleteResult = await this.examSupervisorRepository.nativeDelete({
      exam: { $in: examIds },
    });
    const examDeleteResult = await this.examRepository.nativeDelete({
      id: { $in: examIds },
    });
    return {
      deletedExams: examDeleteResult,
      deletedRegistrations: regDeleteResult,
      deletedSupervisors: supDeleteResult,
    };
  }
}
