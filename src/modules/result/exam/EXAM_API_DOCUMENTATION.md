# API Lịch Thi - Exam APIs Documentation

## Tổng quan

Tài liệu này mô tả các API mới được thêm vào module Exam để:
1. Hiển thị lịch thi theo định dạng timetable (giống như output của scheduling algorithm)
2. Lấy chi tiết kỳ thi bao gồm danh sách sinh viên và giám thị

---

## 1. API Lấy Lịch Thi (Timetable)

### Endpoint
```
GET /api/exams/timetable/view
```

### Mô tả
Lấy danh sách lịch thi theo khoảng thời gian, định dạng giống như output của thuật toán xếp lịch (scheduling).

### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|---------|------|----------|-------|-------|
| startDate | string | Không | Ngày bắt đầu (YYYY-MM-DD) | 2025-01-01 |
| endDate | string | Không | Ngày kết thúc (YYYY-MM-DD) | 2025-01-31 |
| examSessionId | number | Không | ID của đợt thi | 1 |

### Response Format

```json
{
  "timetable": [
    {
      "day": "Thứ Hai",
      "date": "2025-01-15",
      "morning": [
        {
          "time": "08:00 - 09:30",
          "date": "2025-01-15",
          "dayOfWeek": "Thứ Hai",
          "examId": "1",
          "examGroup": "1",
          "courseCode": "IT101",
          "courseName": "Lập trình cơ bản",
          "duration": 90,
          "roomId": "1",
          "roomName": "P101",
          "location": "1",
          "proctor": "1",
          "proctorName": "Nguyễn Văn A",
          "studentCount": 50
        }
      ],
      "afternoon": [
        {
          "time": "14:00 - 15:30",
          "date": "2025-01-15",
          "dayOfWeek": "Thứ Hai",
          "examId": "2",
          "examGroup": "2",
          "courseCode": "IT102",
          "courseName": "Cấu trúc dữ liệu",
          "duration": 90,
          "roomId": "2",
          "roomName": "P102",
          "location": "1",
          "proctor": "2",
          "proctorName": "Trần Thị B",
          "studentCount": 45
        }
      ]
    }
  ],
  "totalExams": 2
}
```

### Ví dụ sử dụng

#### 1. Lấy tất cả lịch thi
```bash
GET /api/exams/timetable/view
```

#### 2. Lấy lịch thi trong khoảng thời gian
```bash
GET /api/exams/timetable/view?startDate=2025-01-01&endDate=2025-01-31
```

#### 3. Lấy lịch thi của một đợt thi cụ thể
```bash
GET /api/exams/timetable/view?examSessionId=1
```

#### 4. Kết hợp các bộ lọc
```bash
GET /api/exams/timetable/view?startDate=2025-01-01&endDate=2025-01-31&examSessionId=1
```

---

## 2. API Lấy Chi Tiết Kỳ Thi

### Endpoint
```
GET /api/exams/:id/detail
```

### Mô tả
Lấy thông tin chi tiết của một kỳ thi bao gồm:
- Thông tin cơ bản về kỳ thi
- Danh sách sinh viên tham gia
- Danh sách giám thị

### Path Parameters

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | number | Có | ID của kỳ thi |

### Response Format

```json
{
  "id": 1,
  "examDate": "2025-01-15T00:00:00.000Z",
  "duration": 90,
  "status": "Draft",
  "examGroupName": "IT101-01",
  "courseCode": "IT101",
  "courseName": "Lập trình cơ bản",
  "roomName": "P101",
  "examSlotName": "Sáng ca 1",
  "students": [
    {
      "id": 1,
      "studentCode": "SV001",
      "fullName": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "className": "K66CNTT1"
    },
    {
      "id": 2,
      "studentCode": "SV002",
      "fullName": "Trần Thị B",
      "email": "tranthib@example.com",
      "className": "K66CNTT1"
    }
  ],
  "supervisors": [
    {
      "id": 1,
      "lecturerCode": "GV001",
      "fullName": "Phạm Văn C",
      "email": "phamvanc@example.com",
      "role": "Supervisor"
    },
    {
      "id": 2,
      "lecturerCode": "GV002",
      "fullName": "Lê Thị D",
      "email": "lethid@example.com",
      "role": "Assistant"
    }
  ]
}
```

### Ví dụ sử dụng

```bash
GET /api/exams/1/detail
```

### Response Fields

#### Exam Information
| Field | Kiểu | Mô tả |
|-------|------|-------|
| id | number | ID của kỳ thi |
| examDate | Date | Ngày thi |
| duration | number | Thời lượng thi (phút) |
| status | string | Trạng thái (Draft/Published/...) |
| examGroupName | string | Tên nhóm thi |
| courseCode | string | Mã môn học |
| courseName | string | Tên môn học |
| roomName | string | Tên phòng thi |
| examSlotName | string | Tên ca thi |

#### Student Information
| Field | Kiểu | Mô tả |
|-------|------|-------|
| id | number | ID sinh viên |
| studentCode | string | Mã sinh viên |
| fullName | string | Họ và tên |
| email | string | Email (từ user account) |
| className | string | Tên lớp |

#### Supervisor Information
| Field | Kiểu | Mô tả |
|-------|------|-------|
| id | number | ID giảng viên |
| lecturerCode | string | Mã giảng viên |
| fullName | string | Họ và tên |
| email | string | Email (từ user account) |
| role | string | Vai trò (Supervisor/Assistant/...) |

---

## Cấu trúc dữ liệu

### TimetableDay
Đại diện cho lịch thi trong một ngày, chia làm 2 buổi (sáng/chiều).

```typescript
{
  day: string;        // "Thứ Hai", "Thứ Ba", ...
  date: string;       // "2025-01-15"
  morning: SimplifiedExamEvent[];
  afternoon: SimplifiedExamEvent[];
}
```

### SimplifiedExamEvent
Thông tin về một kỳ thi trong lịch.

```typescript
{
  time: string;         // "08:00 - 09:30"
  date: string;         // "2025-01-15"
  dayOfWeek: string;    // "Thứ Hai"
  examId: string;       // ID của exam
  examGroup: string;    // ID của exam group
  courseCode: string;   // Mã môn học
  courseName: string;   // Tên môn học
  duration: number;     // Thời lượng (phút)
  roomId: string;       // ID phòng thi
  roomName: string;     // Tên/Mã phòng thi
  location: string;     // ID địa điểm
  proctor: string;      // ID giám thị
  proctorName: string;  // Tên giám thị
  studentCount: number; // Số lượng sinh viên
}
```

---

## Lưu ý kỹ thuật

### 1. Định dạng Timetable
- Lịch thi được nhóm theo ngày
- Mỗi ngày chia thành 2 buổi: sáng (< 12:00) và chiều (>= 12:00)
- Các kỳ thi trong mỗi buổi được sắp xếp theo thời gian bắt đầu

### 2. Populate Relations
API sử dụng MikroORM populate để load các quan hệ:
- Exam → ExamGroup → Course
- Exam → Room → Location
- Exam → ExamSlot
- Exam → Registrations → Student → Classes, User
- Exam → Supervisors → Lecturer → User

### 3. Performance
- API timetable có thể trả về nhiều dữ liệu nếu không lọc
- Nên sử dụng `startDate`, `endDate` hoặc `examSessionId` để giới hạn kết quả
- API detail load toàn bộ sinh viên và giám thị, có thể tốn memory với exam có nhiều SV

### 4. Time Calculation
- `startTime` từ ExamSlot được convert sang phút (ví dụ: "08:00" → 480)
- `endTime` = startTime + duration
- Thời gian được format lại thành chuỗi "HH:MM"

---

## Use Cases

### 1. Hiển thị lịch thi cho admin
```javascript
// Lấy lịch thi của đợt thi hiện tại
const response = await fetch('/api/exams/timetable/view?examSessionId=1');
const { timetable, totalExams } = await response.json();

// Render theo từng ngày
timetable.forEach(day => {
  console.log(`${day.day} - ${day.date}`);
  console.log('Sáng:', day.morning.length, 'kỳ thi');
  console.log('Chiều:', day.afternoon.length, 'kỳ thi');
});
```

### 2. Hiển thị lịch thi cho sinh viên
```javascript
// Lấy lịch thi trong tháng 1/2025
const response = await fetch(
  '/api/exams/timetable/view?startDate=2025-01-01&endDate=2025-01-31'
);
const { timetable } = await response.json();

// Lọc các kỳ thi mà sinh viên tham gia
// (Cần kết hợp với API khác hoặc thông tin từ client)
```

### 3. Xem chi tiết một kỳ thi
```javascript
// Lấy chi tiết kỳ thi ID = 1
const response = await fetch('/api/exams/1/detail');
const examDetail = await response.json();

console.log('Môn thi:', examDetail.courseName);
console.log('Số sinh viên:', examDetail.students.length);
console.log('Giám thị:', examDetail.supervisors.map(s => s.fullName).join(', '));
```

### 4. Export danh sách sinh viên dự thi
```javascript
const response = await fetch('/api/exams/1/detail');
const { students, courseName, examDate } = await response.json();

// Export to Excel, PDF, etc.
exportToExcel({
  title: `Danh sách sinh viên - ${courseName}`,
  date: examDate,
  data: students
});
```

---

## Error Handling

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy kỳ thi",
  "error": "Not Found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["startDate must be a valid ISO 8601 date string"],
  "error": "Bad Request"
}
```

---

## Testing

### Test API Timetable
```bash
# Test 1: No filters
curl -X GET "http://localhost:3000/api/exams/timetable/view"

# Test 2: With date range
curl -X GET "http://localhost:3000/api/exams/timetable/view?startDate=2025-01-01&endDate=2025-01-31"

# Test 3: With exam session
curl -X GET "http://localhost:3000/api/exams/timetable/view?examSessionId=1"
```

### Test API Detail
```bash
# Test 1: Valid exam ID
curl -X GET "http://localhost:3000/api/exams/1/detail"

# Test 2: Invalid exam ID (should return 404)
curl -X GET "http://localhost:3000/api/exams/99999/detail"
```

---

## Changelog

### Version 1.0.0 (2025-01-15)
- Thêm API `GET /api/exams/timetable/view` để lấy lịch thi theo định dạng timetable
- Thêm API `GET /api/exams/:id/detail` để lấy chi tiết kỳ thi với danh sách SV và giám thị
- Thêm các DTO: `ExamTimetableFilterDto`, `ExamTimetableResponseDto`, `ExamDetailDto`
- Thêm utility functions: `formatDateToYYYYMMDD`, `getDayOfWeekName`, `timeToMinutes`, `minutesToTime`
