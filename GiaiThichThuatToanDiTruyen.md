# Thuật Toán Di Truyền Trong Sắp Xếp Lịch Thi

## 1. Giới Thiệu

Thuật toán di truyền (Genetic Algorithm - GA) là một phương pháp tối ưu hóa dựa trên nguyên lý tiến hóa tự nhiên của Charles Darwin. Trong bài toán sắp xếp lịch thi, GA được sử dụng để tìm ra lịch thi tối ưu thỏa mãn nhiều ràng buộc khác nhau.

## 2. Các Khái Niệm Cơ Bản

### 2.1. Nhiễm Sắc Thể (Chromosome)
- **Định nghĩa**: Một lời giải khả thi cho bài toán (một lịch thi cụ thể)
- **Cấu trúc**: Chuỗi các gen, mỗi gen đại diện cho một thông tin về ca thi

### 2.2. Gen (Gene)
- **Định nghĩa**: Một phần tử trong nhiễm sắc thể
- **Trong lịch thi**: Thông tin về một ca thi cụ thể (môn thi, phòng thi, giảng viên, thời gian)

### 2.3. Quần Thể (Population)
- **Định nghĩa**: Tập hợp các nhiễm sắc thể (các lịch thi khác nhau)
- **Kích thước**: Thường từ 50-200 cá thể

### 2.4. Hàm Thích Nghi (Fitness Function)
- **Định nghĩa**: Hàm đánh giá chất lượng của một lời giải
- **Mục tiêu**: Tối đa hóa độ thích nghi (ít vi phạm ràng buộc nhất)

## 3. Các Thành Phần Của Thuật Toán

### 3.1. Khởi Tạo Quần Thể Ban Đầu

```javascript
// Tạo quần thể ban đầu với kích thước populationSize
function initializePopulation(populationSize) {
    const population = [];
    
    for (let i = 0; i < populationSize; i++) {
        // Tạo một lịch thi ngẫu nhiên
        const schedule = generateRandomSchedule();
        population.push(schedule);
    }
    
    return population;
}

// Ví dụ: Tạo một lịch thi ngẫu nhiên
function generateRandomSchedule() {
    const schedule = [];
    
    for (let exam of exams) {
        schedule.push({
            examId: exam.id,
            roomId: getRandomRoom(),
            timeSlot: getRandomTimeSlot(),
            date: getRandomDate(),
            invigilators: getRandomInvigilators()
        });
    }
    
    return schedule;
}
```

### 3.2. Hàm Thích Nghi (Fitness Function)

Hàm này đánh giá chất lượng của lịch thi dựa trên các tiêu chí:

```javascript
function calculateFitness(schedule) {
    let fitness = 1000; // Điểm tối đa
    
    // 1. Kiểm tra xung đột phòng thi
    fitness -= countRoomConflicts(schedule) * 50;
    
    // 2. Kiểm tra xung đột sinh viên (1 sinh viên thi nhiều môn cùng lúc)
    fitness -= countStudentConflicts(schedule) * 100;
    
    // 3. Kiểm tra xung đột giảng viên
    fitness -= countInvigilatorConflicts(schedule) * 80;
    
    // 4. Kiểm tra sức chứa phòng thi
    fitness -= countCapacityViolations(schedule) * 70;
    
    // 5. Kiểm tra khoảng cách giữa các ca thi của sinh viên
    fitness -= countTimeGapViolations(schedule) * 30;
    
    // 6. Tối ưu phân bổ phòng thi (tận dụng phòng)
    fitness += calculateRoomUtilization(schedule) * 20;
    
    return Math.max(0, fitness); // Đảm bảo fitness >= 0
}
```

**Ví dụ cụ thể:**

```javascript
// Lịch thi mẫu
const schedule = [
    {
        examId: "EXAM001",
        subject: "Toán Cao Cấp",
        date: "2025-11-01",
        timeSlot: "08:00-10:00",
        roomId: "P101",
        roomCapacity: 60,
        students: 55,
        invigilators: ["GV001", "GV002"]
    },
    {
        examId: "EXAM002",
        subject: "Vật Lý Đại Cương",
        date: "2025-11-01",
        timeSlot: "08:00-10:00",
        roomId: "P101", // ❌ XUNG ĐỘT: Cùng phòng, cùng thời gian
        roomCapacity: 60,
        students: 50,
        invigilators: ["GV003", "GV004"]
    }
];

// Tính fitness
let fitness = 1000;
fitness -= 1 * 50; // Trừ 50 điểm vì xung đột phòng thi
// fitness = 950
```

### 3.3. Chọn Lọc (Selection)

Chọn các cá thể tốt nhất để lai ghép. Có nhiều phương pháp:

#### a) Chọn Lọc Bánh Xe Roulette (Roulette Wheel Selection)

```javascript
function rouletteWheelSelection(population, fitnessScores) {
    // Tính tổng fitness
    const totalFitness = fitnessScores.reduce((sum, f) => sum + f, 0);
    
    // Tạo xác suất cho mỗi cá thể
    const probabilities = fitnessScores.map(f => f / totalFitness);
    
    // Quay bánh xe
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < population.length; i++) {
        cumulative += probabilities[i];
        if (random <= cumulative) {
            return population[i];
        }
    }
    
    return population[population.length - 1];
}
```

**Ví dụ:**
```
Quần thể: [Schedule1, Schedule2, Schedule3, Schedule4]
Fitness:  [850,       920,       780,       890]
Tổng:     3440

Xác suất:
- Schedule1: 850/3440 = 24.7%
- Schedule2: 920/3440 = 26.7% (cao nhất - dễ được chọn nhất)
- Schedule3: 780/3440 = 22.7%
- Schedule4: 890/3440 = 25.9%
```

#### b) Chọn Lọc Giải Đấu (Tournament Selection)

```javascript
function tournamentSelection(population, fitnessScores, tournamentSize = 3) {
    const tournament = [];
    
    // Chọn ngẫu nhiên tournamentSize cá thể
    for (let i = 0; i < tournamentSize; i++) {
        const randomIndex = Math.floor(Math.random() * population.length);
        tournament.push({
            schedule: population[randomIndex],
            fitness: fitnessScores[randomIndex]
        });
    }
    
    // Chọn cá thể tốt nhất trong giải đấu
    tournament.sort((a, b) => b.fitness - a.fitness);
    return tournament[0].schedule;
}
```

### 3.4. Lai Ghép (Crossover)

Kết hợp hai lịch thi cha mẹ để tạo ra lịch thi con.

#### a) Lai Ghép Một Điểm (Single-Point Crossover)

```javascript
function singlePointCrossover(parent1, parent2) {
    const crossoverPoint = Math.floor(Math.random() * parent1.length);
    
    const child1 = [
        ...parent1.slice(0, crossoverPoint),
        ...parent2.slice(crossoverPoint)
    ];
    
    const child2 = [
        ...parent2.slice(0, crossoverPoint),
        ...parent1.slice(crossoverPoint)
    ];
    
    return [child1, child2];
}
```

**Ví dụ:**
```
Parent1: [E1-R1-T1, E2-R2-T2, E3-R3-T3, E4-R4-T4, E5-R5-T5]
Parent2: [E1-R6-T6, E2-R7-T7, E3-R8-T8, E4-R9-T9, E5-R10-T10]

Crossover Point = 2

Child1: [E1-R1-T1, E2-R2-T2, E3-R8-T8, E4-R9-T9, E5-R10-T10]
         \_____từ Parent1____/  \_______từ Parent2________/

Child2: [E1-R6-T6, E2-R7-T7, E3-R3-T3, E4-R4-T4, E5-R5-T5]
         \_____từ Parent2____/  \_______từ Parent1________/
```

#### b) Lai Ghép Đồng Nhất (Uniform Crossover)

```javascript
function uniformCrossover(parent1, parent2) {
    const child1 = [];
    const child2 = [];
    
    for (let i = 0; i < parent1.length; i++) {
        if (Math.random() < 0.5) {
            child1.push(parent1[i]);
            child2.push(parent2[i]);
        } else {
            child1.push(parent2[i]);
            child2.push(parent1[i]);
        }
    }
    
    return [child1, child2];
}
```

### 3.5. Đột Biến (Mutation)

Thay đổi ngẫu nhiên một số gen để tăng tính đa dạng.

```javascript
function mutate(schedule, mutationRate = 0.1) {
    const mutatedSchedule = [...schedule];
    
    for (let i = 0; i < mutatedSchedule.length; i++) {
        if (Math.random() < mutationRate) {
            // Đột biến: thay đổi phòng thi
            if (Math.random() < 0.33) {
                mutatedSchedule[i].roomId = getRandomRoom();
            }
            // Đột biến: thay đổi thời gian
            else if (Math.random() < 0.66) {
                mutatedSchedule[i].timeSlot = getRandomTimeSlot();
                mutatedSchedule[i].date = getRandomDate();
            }
            // Đột biến: thay đổi giảng viên coi thi
            else {
                mutatedSchedule[i].invigilators = getRandomInvigilators();
            }
        }
    }
    
    return mutatedSchedule;
}
```

**Ví dụ đột biến:**
```
Trước đột biến:
Exam001: {room: "P101", time: "08:00", date: "2025-11-01"}

Sau đột biến (với xác suất 10%):
Exam001: {room: "P205", time: "08:00", date: "2025-11-01"}
                ↑ Đã đột biến phòng thi
```

## 4. Quy Trình Hoạt Động Của Thuật Toán

```javascript
function geneticAlgorithm(config) {
    const {
        populationSize = 100,
        maxGenerations = 1000,
        crossoverRate = 0.8,
        mutationRate = 0.1,
        elitismRate = 0.1
    } = config;
    
    // Bước 1: Khởi tạo quần thể ban đầu
    let population = initializePopulation(populationSize);
    let bestSolution = null;
    let bestFitness = -Infinity;
    
    // Bước 2: Lặp qua các thế hệ
    for (let generation = 0; generation < maxGenerations; generation++) {
        // Bước 3: Tính fitness cho tất cả cá thể
        const fitnessScores = population.map(schedule => 
            calculateFitness(schedule)
        );
        
        // Bước 4: Lưu lại cá thể tốt nhất
        const maxFitness = Math.max(...fitnessScores);
        const maxIndex = fitnessScores.indexOf(maxFitness);
        
        if (maxFitness > bestFitness) {
            bestFitness = maxFitness;
            bestSolution = population[maxIndex];
            console.log(`Generation ${generation}: Best Fitness = ${bestFitness}`);
        }
        
        // Bước 5: Kiểm tra điều kiện dừng
        if (bestFitness >= 1000 || generation === maxGenerations - 1) {
            console.log("Tìm thấy lời giải tối ưu!");
            break;
        }
        
        // Bước 6: Tạo quần thể mới
        const newPopulation = [];
        
        // Giữ lại một số cá thể tốt nhất (Elitism)
        const eliteCount = Math.floor(populationSize * elitismRate);
        const sortedPopulation = population
            .map((schedule, index) => ({ schedule, fitness: fitnessScores[index] }))
            .sort((a, b) => b.fitness - a.fitness);
        
        for (let i = 0; i < eliteCount; i++) {
            newPopulation.push(sortedPopulation[i].schedule);
        }
        
        // Bước 7: Lai ghép và đột biến
        while (newPopulation.length < populationSize) {
            // Chọn lọc cha mẹ
            const parent1 = tournamentSelection(population, fitnessScores);
            const parent2 = tournamentSelection(population, fitnessScores);
            
            // Lai ghép
            let [child1, child2] = Math.random() < crossoverRate
                ? singlePointCrossover(parent1, parent2)
                : [parent1, parent2];
            
            // Đột biến
            child1 = mutate(child1, mutationRate);
            child2 = mutate(child2, mutationRate);
            
            // Thêm vào quần thể mới
            newPopulation.push(child1);
            if (newPopulation.length < populationSize) {
                newPopulation.push(child2);
            }
        }
        
        // Bước 8: Cập nhật quần thể
        population = newPopulation;
    }
    
    return bestSolution;
}
```

## 5. Ví Dụ Chi Tiết

### Bài Toán Cụ Thể

Giả sử cần sắp xếp lịch thi cho 5 môn học:

```javascript
const exams = [
    { id: "E1", name: "Toán Cao Cấp", students: ["SV1", "SV2", "SV3"], duration: 120 },
    { id: "E2", name: "Vật Lý", students: ["SV2", "SV4", "SV5"], duration: 120 },
    { id: "E3", name: "Hóa Học", students: ["SV1", "SV3", "SV5"], duration: 120 },
    { id: "E4", name: "Lập Trình", students: ["SV1", "SV4"], duration: 150 },
    { id: "E5", name: "Cơ Sở Dữ Liệu", students: ["SV2", "SV3", "SV4", "SV5"], duration: 150 }
];

const rooms = [
    { id: "P101", capacity: 3 },
    { id: "P102", capacity: 3 },
    { id: "P201", capacity: 2 }
];

const timeSlots = [
    { id: "T1", time: "08:00-10:00", date: "2025-11-01" },
    { id: "T2", time: "13:00-15:00", date: "2025-11-01" },
    { id: "T3", time: "08:00-10:00", date: "2025-11-02" }
];
```

### Quá Trình Tiến Hóa

**Thế hệ 0 (Khởi tạo ngẫu nhiên):**
```
Schedule1 (Fitness = 650):
  E1: P101, T1 (08:00, 01/11)
  E2: P102, T1 (08:00, 01/11) ← SV2 thi 2 môn cùng lúc ❌
  E3: P101, T2 (13:00, 01/11)
  E4: P201, T1 (08:00, 01/11)
  E5: P102, T3 (08:00, 02/11)

Schedule2 (Fitness = 820):
  E1: P101, T1 (08:00, 01/11)
  E2: P102, T2 (13:00, 01/11) ✓
  E3: P201, T3 (08:00, 02/11) ✓
  E4: P101, T2 (13:00, 01/11) ← Xung đột phòng với E2 ❌
  E5: P102, T3 (08:00, 02/11) ← Xung đột phòng với E3 ❌
```

**Thế hệ 50 (Sau 50 lần tiến hóa):**
```
BestSchedule (Fitness = 940):
  E1: P101, T1 (08:00, 01/11)
  E2: P102, T1 (08:00, 01/11) ← SV2 vẫn thi 2 môn cùng lúc ❌
  E3: P201, T2 (13:00, 01/11)
  E4: P101, T2 (13:00, 01/11) ← Xung đột phòng với E3 ❌
  E5: P102, T3 (08:00, 02/11)
```

**Thế hệ 200 (Lời giải tối ưu):**
```
OptimalSchedule (Fitness = 1000):
  E1: P101, T1 (08:00, 01/11) - [SV1, SV2, SV3] ✓
  E2: P102, T2 (13:00, 01/11) - [SV2, SV4, SV5] ✓
  E3: P201, T3 (08:00, 02/11) - [SV1, SV3, SV5] ✓
  E4: P101, T2 (13:00, 01/11) - [SV1, SV4] ✓
  E5: P102, T3 (08:00, 02/11) - [SV2, SV3, SV4, SV5] ← Xung đột! ❌

Phân tích:
- Không có sinh viên nào thi 2 môn cùng lúc ✓
- Không có xung đột phòng thi ✓
- Tất cả phòng đều đủ sức chứa ✓
- Khoảng cách giữa các ca thi hợp lý ✓
```

### Biểu Đồ Tiến Hóa

```
Fitness
1000 |                                    ●●●●●●●●
     |                                 ●●●
 900 |                            ●●●●●
     |                        ●●●●
 800 |                   ●●●●●
     |               ●●●●
 700 |          ●●●●●
     |      ●●●●
 600 |  ●●●●
     |●●
     +------------------------------------------------
      0    50   100   150   200   250   300  Generations
```

## 6. Ưu Điểm và Nhược Điểm

### Ưu Điểm
✅ **Linh hoạt**: Có thể xử lý nhiều ràng buộc phức tạp  
✅ **Tìm được lời giải gần tối ưu**: Đặc biệt hiệu quả với bài toán NP-hard  
✅ **Dễ song song hóa**: Có thể tính toán đồng thời nhiều cá thể  
✅ **Không cần đạo hàm**: Không yêu cầu hàm mục tiêu khả vi  
✅ **Tránh được tối ưu cục bộ**: Nhờ cơ chế đột biến và lai ghép  

### Nhược Điểm
❌ **Thời gian tính toán**: Có thể mất nhiều thế hệ để hội tụ  
❌ **Không đảm bảo tối ưu toàn cục**: Chỉ tìm được lời giải gần tối ưu  
❌ **Cần điều chỉnh tham số**: Phụ thuộc vào việc chọn tham số phù hợp  
❌ **Khó giải thích**: Không rõ tại sao lời giải lại tốt  

## 7. Tối Ưu Hóa Thuật Toán

### 7.1. Adaptive Mutation Rate
```javascript
function adaptiveMutation(generation, maxGenerations, initialRate = 0.1) {
    // Giảm dần tỷ lệ đột biến theo thời gian
    return initialRate * (1 - generation / maxGenerations);
}
```

### 7.2. Multi-objective Optimization
```javascript
function multiObjectiveFitness(schedule) {
    const objectives = {
        studentConflicts: -countStudentConflicts(schedule),
        roomUtilization: calculateRoomUtilization(schedule),
        timeDistribution: calculateTimeDistribution(schedule),
        invigilatorBalance: calculateInvigilatorBalance(schedule)
    };
    
    // Weighted sum
    return objectives.studentConflicts * 100 +
           objectives.roomUtilization * 50 +
           objectives.timeDistribution * 30 +
           objectives.invigilatorBalance * 20;
}
```

### 7.3. Local Search
```javascript
function localSearch(schedule) {
    let improved = true;
    let currentSchedule = schedule;
    let currentFitness = calculateFitness(currentSchedule);
    
    while (improved) {
        improved = false;
        
        // Thử hoán đổi các cặp ca thi
        for (let i = 0; i < currentSchedule.length; i++) {
            for (let j = i + 1; j < currentSchedule.length; j++) {
                const newSchedule = swapExams(currentSchedule, i, j);
                const newFitness = calculateFitness(newSchedule);
                
                if (newFitness > currentFitness) {
                    currentSchedule = newSchedule;
                    currentFitness = newFitness;
                    improved = true;
                }
            }
        }
    }
    
    return currentSchedule;
}
```

## 8. Kết Luận

Thuật toán di truyền là một công cụ mạnh mẽ để giải quyết bài toán sắp xếp lịch thi. Bằng cách mô phỏng quá trình tiến hóa tự nhiên, GA có thể tìm ra các lịch thi chất lượng cao thỏa mãn nhiều ràng buộc phức tạp.

### Các Bước Triển Khai Thực Tế

1. **Thu thập dữ liệu**: Danh sách môn thi, sinh viên, phòng thi, giảng viên
2. **Xác định ràng buộc**: Hard constraints (bắt buộc) và soft constraints (mong muốn)
3. **Thiết kế hàm fitness**: Gán trọng số phù hợp cho từng ràng buộc
4. **Điều chỉnh tham số**: Thử nghiệm với các giá trị khác nhau
5. **Kiểm thử**: Đánh giá với dữ liệu thực tế
6. **Tối ưu hóa**: Áp dụng các kỹ thuật cải tiến

### Tài Liệu Tham Khảo

- Holland, J. H. (1975). "Adaptation in Natural and Artificial Systems"
- Goldberg, D. E. (1989). "Genetic Algorithms in Search, Optimization, and Machine Learning"
- Burke, E. K., & Petrovic, S. (2002). "Recent research directions in automated timetabling"

---

**Tác giả**: ExamScheduler Development Team  
**Ngày cập nhật**: 23/10/2025
