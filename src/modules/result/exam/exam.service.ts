import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { Exam } from './entities/exam.entity';
import { ExamFilterDto } from './dto/exam-filter.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { plainToInstance } from 'class-transformer';
import { ExamResponseDto } from './dto/exam-response.dto';
import { ExamSession } from '@modules/algorithm-input/exam-session/entities/exam-session.entity';
import { ExamGroup } from '@modules/algorithm-input/exam-group/entities/exam-group.entity';
import { Room } from '@modules/algorithm-input/room/entities/room.entity';
import { ExamSlot } from '@modules/result/exam-slot/entities/exam-slot.entity';
import { Student } from '@modules/core-data/students/entities/student.entity';
import { Lecturer } from '@modules/core-data/lecturer/entities/lecturer.entity';
import { ExamRegistration } from '@modules/result/exam-registration/entities/exam-registration.entity';
import { ExamSupervisor } from '@modules/result/exam-supervisor/entities/exam-supervisor.entity';
import { ExamTimetableFilterDto } from './dto/exam-timetable-filter.dto';
import {
  ExamTimetableResponseDto,
  TimetableDayDto,
  SimplifiedExamEventDto,
} from './dto/exam-timetable-response.dto';
import {
  ExamDetailDto,
  StudentInExamDto,
  SupervisorInExamDto,
} from './dto/exam-detail.dto';

@Injectable()
export class ExamService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateExamDto): Promise<Exam> {
    const [examGroup, room, examSlot] = await Promise.all([
      this.em.findOne(ExamGroup, { id: dto.examGroupId }),
      this.em.findOne(Room, { id: dto.roomId }),
      this.em.findOne(ExamSlot, { id: dto.examSlotId }),
    ]);

    if (!examGroup) throw new NotFoundException('Không tìm thấy nhóm thi');
    if (!room) throw new NotFoundException('Không tìm thấy phòng thi');
    if (!examSlot) throw new NotFoundException('Không tìm thấy ca thi');

    const exam = this.em.create(Exam, {
      examGroup,
      room,
      examSlot,
      examDate: new Date(dto.examDate),
      duration: dto.duration,
      status: dto.status,
    });

    await this.em.persistAndFlush(exam);
    return exam;
  }

  async findAll(
    filter: ExamFilterDto,
  ): Promise<PaginatedResponseDto<ExamResponseDto>> {
    const {
      page = 1,
      limit = 10,
      status,
      examGroupName,
      roomName,
      startDate,
      endDate,
      examSessionId,
    } = filter;
    const offset = (page - 1) * limit;

    const qb = this.em
      .createQueryBuilder(Exam, 'e')
      .leftJoinAndSelect('e.examGroup', 'eg')
      .leftJoinAndSelect('eg.course', 'c')
      .leftJoinAndSelect('eg.examSession', 'es')
      .leftJoinAndSelect('e.room', 'r')
      .leftJoinAndSelect('e.examSlot', 's');

    if (status) qb.andWhere({ status });
    if (examGroupName)
      qb.andWhere('LOWER(eg.name) LIKE LOWER(?)', [`%${examGroupName}%`]);
    if (roomName) qb.andWhere('LOWER(r.name) LIKE LOWER(?)', [`%${roomName}%`]);

    // Lọc theo ngày bắt đầu
    if (startDate) {
      qb.andWhere({ examDate: { $gte: new Date(startDate) } });
    }

    // Lọc theo ngày kết thúc
    if (endDate) {
      const endDateTime = new Date(endDate);
      // Set to end of day to include the entire end date
      endDateTime.setHours(23, 59, 59, 999);
      qb.andWhere({ examDate: { $lte: endDateTime } });
    }

    // Lọc theo exam session
    if (examSessionId) {
      qb.andWhere({ examGroup: { examSession: examSessionId } });
    }

    qb.orderBy({ examDate: 'ASC', examSlot: { startTime: 'ASC' } })
      .limit(limit)
      .offset(offset);

    const [data, total] = await qb.getResultAndCount();
    const items = plainToInstance(ExamResponseDto, data, {
      excludeExtraneousValues: true,
    });

    return PaginatedResponseDto.from(items, page, limit, total);
  }

  async findOne(id: number): Promise<Exam> {
    const exam = await this.em.findOne(
      Exam,
      { id },
      { populate: ['examGroup', 'room', 'examSlot'] },
    );
    if (!exam) throw new NotFoundException('Không tìm thấy kỳ thi');
    return exam;
  }

  async update(id: number, dto: UpdateExamDto): Promise<Exam> {
    const exam = await this.em.findOne(
      Exam,
      { id },
      { populate: ['registrations', 'supervisors'] },
    );
    if (!exam) throw new NotFoundException('Không tìm thấy kỳ thi');

    const cleanDto = Object.fromEntries(
      Object.entries(dto).filter(([_, v]) => v !== undefined),
    );

    // Handle foreign key relations
    if (cleanDto['examSessionId']) {
      const session = await this.em.findOne(ExamSession, {
        id: cleanDto['examSessionId'],
      });
      if (!session) throw new NotFoundException('Không tìm thấy đợt thi');
      cleanDto['examSession'] = session;
      delete cleanDto['examSessionId'];
    }
    if (cleanDto['examGroupId']) {
      const group = await this.em.findOne(ExamGroup, {
        id: cleanDto['examGroupId'],
      });
      if (!group) throw new NotFoundException('Không tìm thấy nhóm thi');
      cleanDto['examGroup'] = group;
      delete cleanDto['examGroupId'];
    }
    if (cleanDto['roomId']) {
      const room = await this.em.findOne(Room, { id: cleanDto['roomId'] });
      if (!room) throw new NotFoundException('Không tìm thấy phòng thi');
      cleanDto['room'] = room;
      delete cleanDto['roomId'];
    }
    if (cleanDto['slotId']) {
      const slot = await this.em.findOne(ExamSlot, {
        id: cleanDto['slotId'],
      });
      if (!slot) throw new NotFoundException('Không tìm thấy ca thi');
      cleanDto['examSlot'] = slot;
      delete cleanDto['slotId'];
    }

    // Handle students update
    if (dto.studentIds !== undefined) {
      // Remove all existing registrations
      await this.em.removeAndFlush(exam.registrations.getItems());

      // Add new registrations
      if (dto.studentIds.length > 0) {
        const students = await this.em.find(Student, {
          id: { $in: dto.studentIds },
        });

        const newRegistrations = students.map((student) =>
          this.em.create(ExamRegistration, {
            exam,
            student,
          }),
        );

        exam.registrations.set(newRegistrations);
      }
      delete cleanDto['studentIds'];
    }

    // Handle supervisors update
    if (dto.supervisorIds !== undefined) {
      // Remove all existing supervisors
      await this.em.removeAndFlush(exam.supervisors.getItems());

      // Add new supervisors
      if (dto.supervisorIds.length > 0) {
        const lecturerIds = dto.supervisorIds.map((s) => s.lecturerId);
        const lecturers = await this.em.find(Lecturer, {
          id: { $in: lecturerIds },
        });

        const newSupervisors = dto.supervisorIds.map((assignment) => {
          const lecturer = lecturers.find(
            (l) => l.id === assignment.lecturerId,
          );
          if (!lecturer) {
            throw new NotFoundException(
              `Không tìm thấy giảng viên với ID ${assignment.lecturerId}`,
            );
          }

          return this.em.create(ExamSupervisor, {
            exam,
            lecturer,
          });
        });

        exam.supervisors.set(newSupervisors);
      }
      delete cleanDto['supervisorIds'];
    }

    this.em.assign(exam, cleanDto);
    await this.em.persistAndFlush(exam);
    return exam;
  }

  async remove(id: number): Promise<boolean> {
    const exam = await this.em.findOne(Exam, { id });
    if (!exam) return false;
    await this.em.removeAndFlush(exam);
    return true;
  }

  /**
   * API: Lấy danh sách lịch thi theo khoảng thời gian
   * Định dạng giống như formatOutput trong scheduling
   */
  async getExamTimetable(
    filter: ExamTimetableFilterDto,
  ): Promise<ExamTimetableResponseDto> {
    const qb = this.em
      .createQueryBuilder(Exam, 'e')
      .leftJoinAndSelect('e.examGroup', 'eg')
      .leftJoinAndSelect('eg.course', 'c')
      .leftJoinAndSelect('e.room', 'r')
      .leftJoinAndSelect('r.location', 'loc')
      .leftJoinAndSelect('e.examSlot', 's')
      .leftJoinAndSelect('e.registrations', 'reg')
      .leftJoinAndSelect('e.supervisors', 'sup')
      .leftJoinAndSelect('sup.lecturer', 'lec');

    // Lọc theo ngày
    if (filter.startDate) {
      qb.andWhere({ examDate: { $gte: new Date(filter.startDate) } });
    }
    if (filter.endDate) {
      const endDate = new Date(filter.endDate);
      qb.andWhere({ examDate: { $lte: endDate } });
    }

    // Lọc theo exam session
    if (filter.examSessionId) {
      qb.andWhere({ examGroup: { examSession: filter.examSessionId } });
    }

    qb.orderBy({ examDate: 'ASC', examSlot: { startTime: 'ASC' } });

    const exams = await qb.getResult();

    // Format theo cấu trúc TimetableDay
    const timetableMap = new Map<string, TimetableDayDto>();

    exams.forEach((exam) => {
      const dateKey = this.formatDateToYYYYMMDD(exam.examDate);
      const dayName = this.getDayOfWeekName(exam.examDate.getDay());

      if (!timetableMap.has(dateKey)) {
        timetableMap.set(dateKey, {
          day: dayName,
          date: dateKey,
          morning: [],
          afternoon: [],
        });
      }

      const daySchedule = timetableMap.get(dateKey)!;

      // Tính toán thời gian bắt đầu và kết thúc
      const startMinutes = this.timeToMinutes(exam.examSlot.startTime);
      const endMinutes = startMinutes + exam.duration;
      const startTime = this.minutesToTime(startMinutes);
      const endTime = this.minutesToTime(endMinutes);

      // Xác định buổi (sáng/chiều)
      const sessionKey = startMinutes < 12 * 60 ? 'morning' : 'afternoon';

      // Lấy giám thị đầu tiên (hoặc tất cả nếu cần)
      const supervisor = exam.supervisors[0];
      const supervisorName = supervisor
        ? `${supervisor.lecturer.firstName} ${supervisor.lecturer.lastName}`
        : '';

      const examEvent: SimplifiedExamEventDto = {
        time: `${startTime} - ${endTime}`,
        date: dateKey,
        dayOfWeek: dayName,
        examId: exam.id.toString(),
        examGroup: exam.examGroup.id.toString(),
        courseCode: exam.examGroup.course.codeCourse,
        courseName: exam.examGroup.course.nameCourse,
        duration: exam.duration,
        roomId: exam.room.id.toString(),
        roomName: exam.room.code,
        location: exam.room.location.id.toString(),
        proctor: supervisor ? supervisor.lecturer.id.toString() : '',
        proctorName: supervisorName,
        studentCount: exam.registrations.length,
      };

      daySchedule[sessionKey].push(examEvent);
    });

    const timetable: TimetableDayDto[] = Array.from(timetableMap.values()).sort(
      (a, b) => a.date.localeCompare(b.date),
    );

    // Sắp xếp theo thời gian trong mỗi buổi
    timetable.forEach((day) => {
      day.morning.sort((a, b) => a.time.localeCompare(b.time));
      day.afternoon.sort((a, b) => a.time.localeCompare(b.time));
    });

    return {
      timetable,
      totalExams: exams.length,
    };
  }

  /**
   * API: Lấy chi tiết kỳ thi bao gồm danh sách sinh viên và giám thị
   */
  async getExamDetail(examId: number): Promise<ExamDetailDto> {
    const exam = await this.em.findOne(
      Exam,
      { id: examId },
      {
        populate: [
          'examGroup',
          'examGroup.course',
          'room',
          'examSlot',
          'registrations',
          'registrations.student',
          'registrations.student.classes',
          'registrations.student.user',
          'supervisors',
          'supervisors.lecturer',
          'supervisors.lecturer.user',
        ],
      },
    );

    if (!exam) {
      throw new NotFoundException('Không tìm thấy kỳ thi');
    }

    // Map students
    const students: StudentInExamDto[] = exam.registrations.map((reg) => ({
      id: reg.student.id,
      studentCode: reg.student.studentCode,
      fullName: `${reg.student.firstName} ${reg.student.lastName}`,
      email: reg.student.user?.email || undefined,
      className: reg.student.classes?.className || undefined,
    }));

    // Map supervisors
    const supervisors: SupervisorInExamDto[] = exam.supervisors.map((sup) => ({
      id: sup.lecturer.id,
      lecturerCode: sup.lecturer.lecturerCode,
      fullName: `${sup.lecturer.firstName} ${sup.lecturer.lastName}`,
      email: sup.lecturer.user?.email || undefined,
    }));

    const result: ExamDetailDto = {
      id: exam.id,
      examDate: exam.examDate,
      duration: exam.duration,
      status: exam.status || 'Draft',
      courseCode: exam.examGroup.course.codeCourse || undefined,
      courseName: exam.examGroup.course.nameCourse || undefined,
      roomName: exam.room.code || undefined,
      examSlotName: exam.examSlot.slotName || undefined,
      students,
      supervisors,
    };

    return plainToInstance(ExamDetailDto, result, {
      excludeExtraneousValues: true,
    });
  }

  // --- Utility functions ---

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

  private timeToMinutes(time: string): number {
    // Chuyển đổi "08:00:00" hoặc "08:00" thành phút
    const parts = time.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${('0' + hours).slice(-2)}:${('0' + mins).slice(-2)}`;
  }
}
