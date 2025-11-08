import { AdvancedConstraintsDto } from './dto/advanced-schedule.dto';

export type Gene = {
  examGroupId: number;
  roomId: number;
  timeSlotId: number;
  proctorId: number;
};

export type Chromosome = Gene[];

// --- Định nghĩa các đối tượng đã được đơn giản hóa cho thuật toán ---

export interface GaRoom {
  roomId: number;
  capacity: number;
  locationId: number; // location ID
}

export interface GaProctor {
  proctorId: number;
}

export interface GaExamGroup {
  examGroupId: number;
  courseId: number;
  duration: number;
  studentCount: number;
}

export interface GaTimeSlot {
  id: number;
  date: Date; // Ngày thi cụ thể
  examSlotId: number; // <-- THÊM MỚI: ID của ExamSlot từ DB
  start: number; // số phút từ 00:00
  end: number; // số phút từ 00:00
}

// --- Định nghĩa toàn bộ dữ liệu đầu vào cho thuật toán ---
export interface SchedulingProblem {
  examGroups: GaExamGroup[];
  rooms: GaRoom[];
  proctors: GaProctor[];
  timeSlots: GaTimeSlot[];
  studentsByExamGroup: Map<number, number[]>; // Map<examGroupId, studentId[]>
  constraints: AdvancedConstraintsDto; // Giả sử ConstraintsDto được import từ ./dto
}

// --- Định nghĩa cấu trúc đầu ra (cho client) ---

export type SimplifiedExamEvent = {
  time: string; // "08:00 - 09:30"
  date: string; // "2025-05-05"
  dayOfWeek: string; // "Thứ Hai"
  examGroup: string;
  courseId: number;
  duration: number;
  roomId: string;
  locationId: number;
  proctor: string;
  studentCount: number;
};

export type TimetableDay = {
  day: string; // "Thứ Hai"
  date: string; // "2025-05-05"
  morning: SimplifiedExamEvent[];
  afternoon: SimplifiedExamEvent[];
};
