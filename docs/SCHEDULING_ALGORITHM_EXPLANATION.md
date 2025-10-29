# Giải Thích Chi Tiết Thuật Toán Sắp Xếp Lịch Thi

## 📋 Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Dữ Liệu Đầu Vào](#dữ-liệu-đầu-vào)
3. [Quy Trình Xử Lý](#quy-trình-xử-lý)
4. [Các Bước Thuật Toán](#các-bước-thuật-toán)
5. [Ví Dụ Chi Tiết](#ví-dụ-chi-tiết)
6. [Kết Quả Đầu Ra](#kết-quả-đầu-ra)

---

## 1. Tổng Quan

Hệ thống sử dụng **Thuật toán di truyền (Genetic Algorithm)** để tự động sắp xếp lịch thi, đảm bảo:
- ✅ Không có sinh viên thi 2 môn cùng lúc
- ✅ Không có phòng thi bị trùng lặp
- ✅ Không có giám thị trông thi 2 phòng cùng lúc
- ✅ Sức chứa phòng thi đủ cho số lượng sinh viên
- ⚡ Tối ưu số ca thi mỗi ngày của sinh viên
- ⚡ Tránh di chuyển giữa các địa điểm trong cùng ngày

---

## 2. Dữ Liệu Đầu Vào

### 2.1. Cấu Trúc Input (`AdvancedScheduleDto`)

```typescript
interface AdvancedScheduleDto {
  students: StudentDto[];      // Danh sách sinh viên
  subjects: SubjectDto[];       // Danh sách môn thi
  rooms: RoomDto[];            // Danh sách phòng thi
  proctors: ProctorDto[];      // Danh sách giám thị
  constraints?: ConstraintsDto; // Các ràng buộc bổ sung
}
```

### 2.2. Chi Tiết Từng Thành Phần

#### **A. Sinh viên (StudentDto)**
```typescript
interface StudentDto {
  studentId: string;      // Mã sinh viên (VD: "SV001")
  subjects: string[];     // Danh sách môn thi (VD: ["MON001", "MON002"])
}
```

**Ví dụ:**
```json
{
  "studentId": "SV001",
  "subjects": ["TOAN", "LY", "HOA"]
}
```
➡️ Sinh viên SV001 đăng ký thi 3 môn: Toán, Lý, Hóa

#### **B. Môn thi (SubjectDto)**
```typescript
interface SubjectDto {
  subjectId: string;      // Mã môn (VD: "TOAN")
  duration: number;       // Thời lượng thi (phút)
}
```

**Ví dụ:**
```json
{
  "subjectId": "TOAN",
  "duration": 90
}
```
➡️ Môn Toán thi trong 90 phút (1.5 giờ)

#### **C. Phòng thi (RoomDto)**
```typescript
interface RoomDto {
  roomId: string;         // Mã phòng (VD: "P101")
  capacity: number;       // Sức chứa
  location: string;       // Địa điểm (VD: "Tòa A")
}
```

**Ví dụ:**
```json
{
  "roomId": "P101",
  "capacity": 30,
  "location": "Tòa A"
}
```
➡️ Phòng P101 ở Tòa A, chứa tối đa 30 sinh viên

#### **D. Giám thị (ProctorDto)**
```typescript
interface ProctorDto {
  proctorId: string;      // Mã giám thị (VD: "GV001")
}
```

**Ví dụ:**
```json
{
  "proctorId": "GV001"
}
```

#### **E. Ràng buộc (ConstraintsDto)**
```typescript
interface ConstraintsDto {
  maxExamsPerStudentPerDay?: number;     // Tối đa ca thi/ngày/SV
  avoidInterLocationTravel?: boolean;    // Tránh di chuyển giữa tòa nhà
}
```

**Ví dụ:**
```json
{
  "maxExamsPerStudentPerDay": 2,
  "avoidInterLocationTravel": true
}
```
➡️ Mỗi sinh viên thi tối đa 2 ca/ngày, tránh di chuyển giữa các tòa

---

## 3. Quy Trình Xử Lý

### 3.1. Sơ Đồ Tổng Quan

```
┌─────────────────┐
│   Input Data    │
│  (DTO Objects)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  1. initializeProblem()         │
│  - Xử lý dữ liệu đầu vào        │
│  - Tạo Map sinh viên-môn học    │
│  - Tạo Time Slots (20 kíp)      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  2. initializePopulation()      │
│  - Tạo 100 lịch thi ngẫu nhiên  │
│  - Mỗi lịch = 1 Chromosome      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  3. Evolution Loop (200 thế hệ) │
│     ┌─────────────────────┐     │
│     │ a. Tính Fitness     │     │
│     │ b. Sắp xếp quần thể │     │
│     │ c. Chọn lọc (Tour.) │     │
│     │ d. Lai ghép         │     │
│     │ e. Đột biến         │     │
│     └─────────────────────┘     │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  4. formatOutput()              │
│  - Định dạng lịch thi theo ngày │
│  - Chia ca sáng/chiều           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Output JSON    │
│  (Timetable)    │
└─────────────────┘
```

---

## 4. Các Bước Thuật Toán

### **BƯỚC 1: Khởi Tạo Bài Toán (`initializeProblem`)**

#### Mục đích:
Chuyển đổi dữ liệu đầu vào thành cấu trúc dễ xử lý cho thuật toán.

#### Chi tiết:

**1.1. Tạo Map Sinh Viên - Môn Học**
```typescript
// Input
students = [
  { studentId: "SV001", subjects: ["TOAN", "LY"] },
  { studentId: "SV002", subjects: ["TOAN", "HOA"] }
]

// Output: studentsBySubject
{
  "TOAN" => ["SV001", "SV002"],
  "LY"   => ["SV001"],
  "HOA"  => ["SV002"]
}
```
➡️ **Lợi ích:** Tra cứu nhanh danh sách sinh viên thi môn nào

**1.2. Tạo Time Slots (Kíp Thi)**

Hệ thống tự động tạo 20 kíp thi trong 5 ngày:

```typescript
// Cấu trúc TimeSlot
interface TimeSlot {
  id: number;      // 0-19
  day: number;     // 1-5 (Thứ 2 - Thứ 6)
  start: number;   // Phút từ 00:00 (VD: 480 = 8:00)
  end: number;     // Sẽ tính sau khi biết thời lượng môn thi
}

// Danh sách 20 kíp thi
[
  { id: 0,  day: 1, start: 480,  end: 0 },  // Thứ 2, 8:00
  { id: 1,  day: 1, start: 600,  end: 0 },  // Thứ 2, 10:00
  { id: 2,  day: 1, start: 840,  end: 0 },  // Thứ 2, 14:00
  { id: 3,  day: 1, start: 960,  end: 0 },  // Thứ 2, 16:00
  { id: 4,  day: 2, start: 480,  end: 0 },  // Thứ 3, 8:00
  // ... (tổng 20 kíp)
]
```

**Lịch thi mẫu:**

| Ngày     | Ca 1 (8:00) | Ca 2 (10:00) | Ca 3 (14:00) | Ca 4 (16:00) |
|----------|-------------|--------------|--------------|--------------|
| Thứ 2    | Slot 0      | Slot 1       | Slot 2       | Slot 3       |
| Thứ 3    | Slot 4      | Slot 5       | Slot 6       | Slot 7       |
| Thứ 4    | Slot 8      | Slot 9       | Slot 10      | Slot 11      |
| Thứ 5    | Slot 12     | Slot 13      | Slot 14      | Slot 15      |
| Thứ 6    | Slot 16     | Slot 17      | Slot 18      | Slot 19      |

---

### **BƯỚC 2: Khởi Tạo Quần Thể (`initializePopulation`)**

#### Mục đích:
Tạo 100 lịch thi ngẫu nhiên làm điểm khởi đầu.

#### Cấu trúc Chromosome (Gen):

```typescript
type Gene = {
  subjectId: string;    // Môn thi nào
  roomId: string;       // Thi ở phòng nào
  timeSlotId: number;   // Thi kíp nào (0-19)
  proctorId: string;    // Giám thị nào
};

type Chromosome = Gene[];  // Một lịch thi = nhiều Gen
```

#### Ví dụ 1 Chromosome:

```javascript
// Giả sử có 3 môn: TOAN, LY, HOA
Chromosome_1 = [
  {
    subjectId: "TOAN",
    roomId: "P101",
    timeSlotId: 0,      // Thứ 2, 8:00
    proctorId: "GV001"
  },
  {
    subjectId: "LY",
    roomId: "P102",
    timeSlotId: 5,      // Thứ 3, 10:00
    proctorId: "GV002"
  },
  {
    subjectId: "HOA",
    roomId: "P101",     // ❌ Cùng phòng với TOAN
    timeSlotId: 0,      // ❌ Cùng kíp với TOAN
    proctorId: "GV003"
  }
]
// Fitness = Rất thấp (nhiều vi phạm)
```

**Quần thể ban đầu:**
```
Population = [
  Chromosome_1,   // Fitness: 2000 (2 vi phạm hard)
  Chromosome_2,   // Fitness: 1000 (1 vi phạm hard)
  Chromosome_3,   // Fitness: 3000 (3 vi phạm hard)
  ...
  Chromosome_100  // Fitness: 500 (0 vi phạm hard, 1 vi phạm soft)
]
```

---

### **BƯỚC 3: Tính Điểm Thích Nghi (`calculateFitness`)**

#### Công thức:
```
Fitness = (Số vi phạm hard × 1000) + (Số vi phạm soft × trọng số)
```
**🎯 Mục tiêu: Fitness càng THẤP càng TốT (0 = hoàn hảo)**

#### Các Loại Vi Phạm:

| Loại | Mô tả | Phạt |
|------|-------|------|
| **HARD 1** | Phòng thi trùng lặp | 1000 |
| **HARD 2** | Giám thị trùng giờ | 1000 |
| **HARD 3** | Sinh viên thi 2 môn cùng lúc | 1000 |
| **HARD 4** | Vượt sức chứa phòng | 1000 |
| **SOFT 1** | Quá nhiều ca thi/ngày | 10 |
| **SOFT 2** | Di chuyển giữa các tòa | 5 |

#### Ví Dụ Chi Tiết:

**Lịch thi cần đánh giá:**
```javascript
Chromosome = [
  { subjectId: "TOAN", roomId: "P101", timeSlotId: 0, proctorId: "GV001" },
  { subjectId: "LY",   roomId: "P101", timeSlotId: 0, proctorId: "GV002" },
  { subjectId: "HOA",  roomId: "P102", timeSlotId: 0, proctorId: "GV001" }
]

// Giả sử:
// - SV001 thi cả TOAN và LY
// - SV002 thi cả LY và HOA
// - P101 chứa 30 SV, TOAN có 25 SV, LY có 28 SV
```

**Phân tích vi phạm:**

1️⃣ **Phòng P101 - Kíp 0:**
```
TOAN: P101, Kíp 0 (25 SV)
LY:   P101, Kíp 0 (28 SV)  ❌ Trùng phòng!
```
➡️ Vi phạm HARD 1: +1000 điểm

2️⃣ **Giám thị GV001:**
```
TOAN: GV001, Kíp 0
HOA:  GV001, Kíp 0  ❌ Trùng giờ!
```
➡️ Vi phạm HARD 2: +1000 điểm

3️⃣ **Sinh viên SV001:**
```
Kíp 0: Thi TOAN và LY cùng lúc  ❌
```
➡️ Vi phạm HARD 3: +1000 điểm

**Tổng Fitness = 3000** (Rất tệ!)

#### Code Tính Fitness:

```typescript
private calculateFitness(chromosome: Chromosome): number {
  let hardConflicts = 0;
  let softConflicts = 0;
  
  // Các Map để theo dõi xung đột
  const roomSchedule = new Map<string, Gene[]>();
  const proctorSchedule = new Map<string, Gene[]>();
  const studentSchedule = new Map<string, Gene[]>();
  
  for (const gene of chromosome) {
    const room = this.rooms.find(r => r.roomId === gene.roomId);
    const students = this.studentsBySubject.get(gene.subjectId);
    
    // Kiểm tra sức chứa
    if (students.length > room.capacity) {
      hardConflicts++;  // +1000
    }
    
    // Gom nhóm theo phòng-kíp
    const roomKey = `${gene.roomId}-${gene.timeSlotId}`;
    if (!roomSchedule.has(roomKey)) roomSchedule.set(roomKey, []);
    roomSchedule.get(roomKey).push(gene);
    
    // Tương tự cho giám thị và sinh viên...
  }
  
  // Đếm xung đột
  roomSchedule.forEach(genes => {
    if (genes.length > 1) {
      hardConflicts += genes.length - 1; // 2 môn = +1, 3 môn = +2
    }
  });
  
  return hardConflicts * 1000 + softConflicts;
}
```

---

### **BƯỚC 4: Chọn Lọc Giải Đấu (`tournamentSelection`)**

#### Nguyên lý:
Chọn ngẫu nhiên 5 cá thể, giữ lại cá thể tốt nhất.

#### Ví dụ:

**Quần thể:**
```
Chromosome_1:  Fitness = 2000
Chromosome_2:  Fitness = 500   ⭐ Tốt nhất
Chromosome_3:  Fitness = 1500
...
Chromosome_100: Fitness = 800
```

**Giải đấu 1:**
```
Chọn ngẫu nhiên: [Ch_7, Ch_23, Ch_45, Ch_78, Ch_91]
Fitness:         [1200, 800,  500,  1000, 1500]
                             ↑ Thắng!
➡️ Trả về: Chromosome_45 (Fitness = 500)
```

**Giải đấu 2:**
```
Chọn ngẫu nhiên: [Ch_12, Ch_34, Ch_56, Ch_78, Ch_90]
Fitness:         [300,  1500, 700,  1000, 200]
                 ↑ Thắng!
➡️ Trả về: Chromosome_12 (Fitness = 300)
```

---

### **BƯỚC 5: Lai Ghép (`crossover`)**

#### Mục đích:
Kết hợp 2 lịch thi cha mẹ để tạo lịch thi con.

#### Phương pháp: Single-Point Crossover

```typescript
private crossover(parent1: Chromosome, parent2: Chromosome): Chromosome {
  const crossoverPoint = Math.floor(Math.random() * parent1.length);
  return [
    ...parent1.slice(0, crossoverPoint),
    ...parent2.slice(crossoverPoint)
  ];
}
```

#### Ví dụ Chi Tiết:

**Cha mẹ:**
```javascript
Parent1 = [
  { subjectId: "TOAN", roomId: "P101", timeSlotId: 0,  proctorId: "GV001" },
  { subjectId: "LY",   roomId: "P102", timeSlotId: 5,  proctorId: "GV002" },
  { subjectId: "HOA",  roomId: "P103", timeSlotId: 10, proctorId: "GV003" },
  { subjectId: "ANH",  roomId: "P104", timeSlotId: 15, proctorId: "GV004" }
]

Parent2 = [
  { subjectId: "TOAN", roomId: "P201", timeSlotId: 2,  proctorId: "GV005" },
  { subjectId: "LY",   roomId: "P202", timeSlotId: 7,  proctorId: "GV006" },
  { subjectId: "HOA",  roomId: "P203", timeSlotId: 12, proctorId: "GV007" },
  { subjectId: "ANH",  roomId: "P204", timeSlotId: 17, proctorId: "GV008" }
]

// Crossover Point = 2
```

**Con:**
```javascript
Child = [
  // Từ Parent1 (0 đến 2)
  { subjectId: "TOAN", roomId: "P101", timeSlotId: 0,  proctorId: "GV001" },
  { subjectId: "LY",   roomId: "P102", timeSlotId: 5,  proctorId: "GV002" },
  
  // Từ Parent2 (2 đến hết)
  { subjectId: "HOA",  roomId: "P203", timeSlotId: 12, proctorId: "GV007" },
  { subjectId: "ANH",  roomId: "P204", timeSlotId: 17, proctorId: "GV008" }
]
```

**Giải thích:**
- Lấy 2 gen đầu từ Parent1 (lịch thi TOAN, LY của P1)
- Lấy 2 gen cuối từ Parent2 (lịch thi HOA, ANH của P2)
- Kết quả: Con thừa hưởng đặc điểm của cả 2 cha mẹ

---

### **BƯỚC 6: Đột Biến (`mutate`)**

#### Mục đích:
Tạo sự đa dạng, tránh thuật toán bị "mắc kẹt" ở lời giải tồi.

#### Xác suất: 10% (MUTATION_RATE = 0.1)

#### 3 Loại Đột Biến:

```typescript
private mutate(chromosome: Chromosome): Chromosome {
  const geneIndex = Math.floor(Math.random() * chromosome.length);
  const mutationType = Math.floor(Math.random() * 3);
  
  switch(mutationType) {
    case 0: // Đổi phòng
      chromosome[geneIndex].roomId = randomRoom();
      break;
    case 1: // Đổi kíp thi
      chromosome[geneIndex].timeSlotId = randomTimeSlot();
      break;
    case 2: // Đổi giám thị
      chromosome[geneIndex].proctorId = randomProctor();
      break;
  }
  return chromosome;
}
```

#### Ví Dụ:

**Trước đột biến:**
```javascript
Chromosome = [
  { subjectId: "TOAN", roomId: "P101", timeSlotId: 0, proctorId: "GV001" },
  { subjectId: "LY",   roomId: "P102", timeSlotId: 5, proctorId: "GV002" },
  { subjectId: "HOA",  roomId: "P103", timeSlotId: 10, proctorId: "GV003" }
]
```

**Sau đột biến (gen thứ 1, đổi phòng):**
```javascript
Chromosome = [
  { subjectId: "TOAN", roomId: "P101", timeSlotId: 0, proctorId: "GV001" },
  { subjectId: "LY",   roomId: "P205", timeSlotId: 5, proctorId: "GV002" }, // ← Đổi từ P102 → P205
  { subjectId: "HOA",  roomId: "P103", timeSlotId: 10, proctorId: "GV003" }
]
```

**Tác dụng:**
- Có thể phá vỡ xung đột phòng thi
- Hoặc tạo ra giải pháp mới tốt hơn ngẫu nhiên
- Đôi khi làm xấu đi (nhưng cần thiết để thoát tối ưu cục bộ)

---

### **BƯỚC 7: Vòng Lặp Tiến Hóa (200 thế hệ)**

#### Quy trình:

```typescript
for (let gen = 0; gen < 200; gen++) {
  // 1. Tính fitness cho tất cả 100 cá thể
  const populationWithFitness = population.map(chromosome => ({
    chromosome,
    fitness: calculateFitness(chromosome)
  }));
  
  // 2. Sắp xếp theo fitness (thấp → cao)
  populationWithFitness.sort((a, b) => a.fitness - b.fitness);
  
  // 3. Lưu lại cá thể tốt nhất
  if (populationWithFitness[0].fitness < bestFitness) {
    bestSchedule = populationWithFitness[0].chromosome;
    bestFitness = populationWithFitness[0].fitness;
  }
  
  // 4. Dừng sớm nếu tìm thấy lời giải hoàn hảo
  if (bestFitness === 0) {
    console.log("✅ Tìm thấy lịch thi hoàn hảo!");
    break;
  }
  
  // 5. Tạo thế hệ mới
  const newPopulation = [];
  
  // 5.1. Elitism: Giữ 2 cá thể tốt nhất
  newPopulation.push(populationWithFitness[0].chromosome);
  newPopulation.push(populationWithFitness[1].chromosome);
  
  // 5.2. Tạo 98 cá thể mới
  while (newPopulation.length < 100) {
    const parent1 = tournamentSelection(populationWithFitness);
    const parent2 = tournamentSelection(populationWithFitness);
    let child = crossover(parent1, parent2);
    
    if (Math.random() < 0.1) {
      child = mutate(child);
    }
    
    newPopulation.push(child);
  }
  
  population = newPopulation;
}
```

#### Biểu Đồ Tiến Hóa:

```
Fitness
3000 |●
     |
2500 | ●
     |
2000 |  ●●
     |    ●●
1500 |      ●●●
     |         ●●●●
1000 |             ●●●●●●
     |                   ●●●●●
 500 |                       ●●●●●●●
     |                              ●●●●●●●
   0 |                                     ●●●●●●●●
     +-----------------------------------------------
      0   20   40   60   80  100  120  140  160  180  200
                        Thế hệ
```

**Giải thích:**
- Thế hệ 0-50: Giảm nhanh (loại bỏ lịch thi tệ)
- Thế hệ 50-150: Cải thiện dần (tinh chỉnh)
- Thế hệ 150-200: Hội tụ về lời giải tối ưu

---

## 5. Ví Dụ Chi Tiết Từ Đầu Đến Cuối

### 5.1. Input Dữ Liệu

```json
{
  "students": [
    { "studentId": "SV001", "subjects": ["TOAN", "LY", "HOA"] },
    { "studentId": "SV002", "subjects": ["TOAN", "ANH"] },
    { "studentId": "SV003", "subjects": ["LY", "HOA", "ANH"] },
    { "studentId": "SV004", "subjects": ["TOAN", "LY"] }
  ],
  "subjects": [
    { "subjectId": "TOAN", "duration": 90 },
    { "subjectId": "LY", "duration": 90 },
    { "subjectId": "HOA", "duration": 120 },
    { "subjectId": "ANH", "duration": 60 }
  ],
  "rooms": [
    { "roomId": "P101", "capacity": 3, "location": "Tòa A" },
    { "roomId": "P102", "capacity": 2, "location": "Tòa A" },
    { "roomId": "P201", "capacity": 3, "location": "Tòa B" }
  ],
  "proctors": [
    { "proctorId": "GV001" },
    { "proctorId": "GV002" },
    { "proctorId": "GV003" }
  ],
  "constraints": {
    "maxExamsPerStudentPerDay": 2,
    "avoidInterLocationTravel": true
  }
}
```

### 5.2. Sau Bước 1: initializeProblem

**Map Sinh Viên - Môn Học:**
```javascript
studentsBySubject = {
  "TOAN" => ["SV001", "SV002", "SV004"],  // 3 SV
  "LY"   => ["SV001", "SV003", "SV004"],  // 3 SV
  "HOA"  => ["SV001", "SV003"],           // 2 SV
  "ANH"  => ["SV002", "SV003"]            // 2 SV
}
```

**Time Slots (5 ngày × 4 ca = 20 kíp):**
```
ID 0:  Thứ 2, 8:00   |  ID 10: Thứ 4, 14:00
ID 1:  Thứ 2, 10:00  |  ID 11: Thứ 4, 16:00
...
```

### 5.3. Sau Bước 2: initializePopulation

**Chromosome ngẫu nhiên #1:**
```javascript
[
  { subjectId: "TOAN", roomId: "P101", timeSlotId: 0,  proctorId: "GV001" },
  { subjectId: "LY",   roomId: "P102", timeSlotId: 0,  proctorId: "GV002" },
  { subjectId: "HOA",  roomId: "P201", timeSlotId: 5,  proctorId: "GV003" },
  { subjectId: "ANH",  roomId: "P101", timeSlotId: 10, proctorId: "GV001" }
]
```

**Phân tích:**
- TOAN và LY cùng kíp 0 (Thứ 2, 8:00)
- SV001 thi TOAN và LY cùng lúc ❌ → Vi phạm HARD
- Fitness = 1000

### 5.4. Sau 200 Thế Hệ: Lời Giải Tốt Nhất

**Chromosome tối ưu:**
```javascript
[
  { subjectId: "TOAN", roomId: "P101", timeSlotId: 0,  proctorId: "GV001" },
  { subjectId: "LY",   roomId: "P102", timeSlotId: 2,  proctorId: "GV002" },
  { subjectId: "HOA",  roomId: "P201", timeSlotId: 4,  proctorId: "GV003" },
  { subjectId: "ANH",  roomId: "P101", timeSlotId: 6,  proctorId: "GV001" }
]
```

**Kiểm tra:**

| Môn  | Phòng | Kíp | Thời gian        | Giám thị | SV        |
|------|-------|-----|------------------|----------|-----------|
| TOAN | P101  | 0   | Thứ 2, 8:00-9:30 | GV001    | 3 (✓ ≤ 3) |
| LY   | P102  | 2   | Thứ 2, 14:00-15:30 | GV002  | 3 (❌ > 2)|
| HOA  | P201  | 4   | Thứ 3, 8:00-10:00| GV003    | 2 (✓ ≤ 3) |
| ANH  | P101  | 6   | Thứ 3, 14:00-15:00| GV001   | 2 (✓ ≤ 3) |

**Vấn đề:** LY có 3 SV nhưng P102 chỉ chứa 2!
➡️ Fitness = 1000 (vẫn còn vi phạm)

**Tiếp tục tiến hóa → Lời giải hoàn hảo:**
```javascript
[
  { subjectId: "TOAN", roomId: "P101", timeSlotId: 0,  proctorId: "GV001" },
  { subjectId: "LY",   roomId: "P201", timeSlotId: 2,  proctorId: "GV002" }, // Đổi sang P201
  { subjectId: "HOA",  roomId: "P102", timeSlotId: 4,  proctorId: "GV003" },
  { subjectId: "ANH",  roomId: "P101", timeSlotId: 6,  proctorId: "GV001" }
]
```

**Kiểm tra lại:**

✅ Không có phòng trùng  
✅ Không có giám thị trùng  
✅ Không có SV thi 2 môn cùng lúc  
✅ Tất cả phòng đủ sức chứa  
✅ Fitness = 0 (Hoàn hảo!)

---

## 6. Kết Quả Đầu Ra

### 6.1. Cấu Trúc Output

```typescript
interface Output {
  fitness: number;        // Điểm fitness (0 = tốt nhất)
  isOptimal: boolean;     // true nếu fitness === 0
  timetable: DaySchedule[]; // Lịch thi theo ngày
}

interface DaySchedule {
  day: string;                  // "Thứ Hai", "Thứ Ba"...
  morning: SessionSchedule;     // Ca sáng
  afternoon: SessionSchedule;   // Ca chiều
}

interface SessionSchedule {
  [roomId: string]: ExamDetails[];
}

interface ExamDetails {
  time: string;           // "8:00 - 9:30"
  subject: string;        // "TOAN"
  duration: number;       // 90
  room: string;           // "P101"
  location: string;       // "Tòa A"
  proctor: string;        // "GV001"
  studentCount: number;   // 3
  students: string[];     // ["SV001", "SV002", "SV004"]
}
```

### 6.2. JSON Output Mẫu

```json
{
  "fitness": 0,
  "isOptimal": true,
  "timetable": [
    {
      "day": "Thứ Hai",
      "morning": {
        "P101": [
          {
            "time": "8:00 - 9:30",
            "subject": "TOAN",
            "duration": 90,
            "room": "P101",
            "location": "Tòa A",
            "proctor": "GV001",
            "studentCount": 3,
            "students": ["SV001", "SV002", "SV004"]
          }
        ]
      },
      "afternoon": {
        "P201": [
          {
            "time": "14:00 - 15:30",
            "subject": "LY",
            "duration": 90,
            "room": "P201",
            "location": "Tòa B",
            "proctor": "GV002",
            "studentCount": 3,
            "students": ["SV001", "SV003", "SV004"]
          }
        ]
      }
    },
    {
      "day": "Thứ Ba",
      "morning": {
        "P102": [
          {
            "time": "8:00 - 10:00",
            "subject": "HOA",
            "duration": 120,
            "room": "P102",
            "location": "Tòa A",
            "proctor": "GV003",
            "studentCount": 2,
            "students": ["SV001", "SV003"]
          }
        ]
      },
      "afternoon": {
        "P101": [
          {
            "time": "14:00 - 15:00",
            "subject": "ANH",
            "duration": 60,
            "room": "P101",
            "location": "Tòa A",
            "proctor": "GV001",
            "studentCount": 2,
            "students": ["SV002", "SV003"]
          }
        ]
      }
    }
  ]
}
```

### 6.3. Hiển thị Trực Quan

**Lịch Thi Thứ Hai:**

| Thời gian | Phòng P101 | Phòng P102 | Phòng P201 |
|-----------|------------|------------|------------|
| **Sáng** | | | |
| 8:00-9:30 | TOAN (GV001)<br>3 SV | | |
| 10:00-12:00 | | | |
| **Chiều** | | | |
| 14:00-15:30 | | | LY (GV002)<br>3 SV |
| 16:00-18:00 | | | |

**Lịch Thi Thứ Ba:**

| Thời gian | Phòng P101 | Phòng P102 | Phòng P201 |
|-----------|------------|------------|------------|
| **Sáng** | | | |
| 8:00-10:00 | | HOA (GV003)<br>2 SV | |
| 10:00-12:00 | | | |
| **Chiều** | | | |
| 14:00-15:00 | ANH (GV001)<br>2 SV | | |
| 16:00-18:00 | | | |

---

## 7. Tối Ưu Hóa & Mở Rộng

### 7.1. Tăng Hiệu Suất

**1. Parallel Fitness Calculation**
```typescript
const fitnessScores = await Promise.all(
  population.map(chromosome => calculateFitness(chromosome))
);
```

**2. Early Stopping**
```typescript
if (bestFitness === 0) {
  console.log(`✅ Found perfect solution at generation ${gen}`);
  break;
}
```

**3. Adaptive Mutation Rate**
```typescript
const mutationRate = 0.1 * (1 - gen / GENERATIONS);
// Gen 0: 10%
// Gen 100: 5%
// Gen 200: 0%
```

### 7.2. Thêm Ràng Buộc

**Ví dụ: Giảng viên không rảnh**
```typescript
interface ProctorDto {
  proctorId: string;
  unavailableTimeSlots: number[];  // [0, 5, 10]
}

// Trong calculateFitness:
if (proctor.unavailableTimeSlots.includes(gene.timeSlotId)) {
  hardConflicts++;
}
```

**Ví dụ: Môn thi ưu tiên**
```typescript
interface SubjectDto {
  subjectId: string;
  duration: number;
  priority: 'high' | 'medium' | 'low';
}

// Ưu tiên xếp môn priority='high' vào ca sáng
if (subject.priority === 'high' && timeSlot.start >= 12*60) {
  softConflicts += 20;
}
```

---

## 8. Kết Luận

### Tóm Tắt Quy Trình:

1. **Input** → DTO objects
2. **Initialize** → Tạo Map & Time Slots
3. **Population** → 100 lịch thi ngẫu nhiên
4. **Evolution** → 200 thế hệ
   - Tính fitness
   - Chọn lọc
   - Lai ghép
   - Đột biến
5. **Output** → Lịch thi tối ưu

### Ưu Điểm:

✅ Tự động hóa hoàn toàn  
✅ Xử lý được bài toán phức tạp  
✅ Linh hoạt với nhiều ràng buộc  
✅ Có thể tìm lời giải gần tối ưu  

### Hạn Chế:

❌ Không đảm bảo 100% tìm được lời giải hoàn hảo  
❌ Thời gian chạy phụ thuộc vào số lượng môn thi  
❌ Cần điều chỉnh tham số (POPULATION_SIZE, GENERATIONS)  

---

