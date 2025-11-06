// --- Hằng số cho thuật toán di truyền ---
export const POPULATION_SIZE = 100;
export const GENERATIONS = 200;
export const MUTATION_RATE = 0.01;
export const TOURNAMENT_SIZE = 5;
export const ELITISM_COUNT = 2;

// --- Trọng số cho các vi phạm ràng buộc ---
export const HARD_CONSTRAINT_PENALTY = 100000;
export const SOFT_CONSTRAINT_PENALTY = {
  STUDENT_EXAMS_PER_DAY: 10,
  INTER_LOCATION_TRAVEL: 5,
  EXAM_SPACING: 25, // lịch thi gần nhau
};

// --- Các kíp thi trong ngày (giờ * 60) ---
export const DAILY_START_HOURS = [8, 10, 14, 16]; // 8h, 10h, 14h, 16h

// --- Hằng số cho đột biến ---
export const MAX_MUTATION_ATTEMPTS = 10;
