export interface ExamScheduleGene {
  examGroupId: number;
  roomId: number;
  lecturerId: number;
  examSlotId: number; // Ca thi
  date: string; // Ngày thi (yyyy-mm-dd)
}

export interface Individual {
  genes: ExamScheduleGene[];
  fitness?: number;
}

export interface Population {
  individuals: Individual[];
}
