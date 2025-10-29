# Exam Grouping Service - Hướng Dẫn Sử Dụng

## 📋 Tổng Quan

Module này cung cấp chức năng chia sinh viên thành các nhóm thi (exam groups) dựa trên sức chứa phòng thi.

## 🚀 Cách Sử Dụng

### Phương Thức 1: Đọc từ file data.json (MỚI)

**Endpoint:** `GET /exam-grouping/process-data-file`

**Mô tả:** 
- Tự động đọc file `data.json` trong thư mục hiện tại
- Xử lý logic chia nhóm
- Lưu kết quả vào file `output.json`
- Trả về response với kết quả

**Cách gọi:**
```bash
# Sử dụng curl
curl -X GET http://localhost:3000/exam-grouping/process-data-file

# Sử dụng fetch (JavaScript)
fetch('http://localhost:3000/exam-grouping/process-data-file')
  .then(res => res.json())
  .then(data => console.log(data));
```

**Response mẫu:**
```json
{
  "success": true,
  "message": "Xử lý dữ liệu thành công",
  "outputFile": "d:\\path\\to\\output.json",
  "data": {
    "examGroups": [
      {
        "examGroupId": "MH001-G1",
        "courseCode": "MH001",
        "studentCount": 60,
        "duration": 90
      },
      {
        "examGroupId": "MH001-G2",
        "courseCode": "MH001",
        "studentCount": 60,
        "duration": 90
      }
      // ... more groups
    ],
    "students": [
      {
        "studentId": "SV001",
        "examGroups": ["MH001-G1", "MH002-G1", "MH003-G1"]
      }
      // ... more students
    ]
  }
}
```

**File output.json được tạo:**
```json
{
  "metadata": {
    "processedAt": "2025-10-28T10:30:00.000Z",
    "totalExamGroups": 87,
    "totalStudents": 500,
    "totalCourses": 10
  },
  "data": {
    "examGroups": [...],
    "students": [...]
  }
}
```

---

### Phương Thức 2: Gửi dữ liệu qua Body (Cũ)

**Endpoint:** `POST /exam-grouping/generate-groups`

**Mô tả:** Gửi dữ liệu trực tiếp qua request body

**Request Body:**
```json
{
  "rawRegistrations": [
    { "studentId": "SV001", "courseCode": "MH001" },
    { "studentId": "SV001", "courseCode": "MH002" },
    { "studentId": "SV002", "courseCode": "MH001" }
  ],
  "allRooms": [
    { "roomId": "P101", "capacity": 60, "location": "D9" },
    { "roomId": "P102", "capacity": 40, "location": "A3" }
  ],
  "allCourses": [
    { "courseCode": "MH001", "duration": 90 },
    { "courseCode": "MH002", "duration": 120 }
  ]
}
```

---

## 📊 Cấu Trúc File data.json

```json
{
  "rawRegistrations": [
    {
      "studentId": "SV001",
      "courseCode": ["MH001", "MH002", "MH003"]
    },
    {
      "studentId": "SV002",
      "courseCode": ["MH001", "MH004"]
    }
  ],
  "allRooms": [
    { "roomId": "P101", "capacity": 55, "location": "D9" },
    { "roomId": "P102", "capacity": 40, "location": "A3" }
  ],
  "allCourses": [
    { "courseCode": "MH001", "duration": 90 },
    { "courseCode": "MH002", "duration": 120 }
  ]
}
```

**Lưu ý:**
- Hệ thống tự động xử lý cả `courseCode` (đúng) và `corseCodes` (typo)
- Mỗi sinh viên có thể đăng ký nhiều môn học (array)

---

## 🔄 Quy Trình Xử Lý

```
┌─────────────────┐
│   data.json     │
│  (Input File)   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  1. Đọc file                │
│  2. Parse JSON              │
│  3. Transform data          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  4. Xây dựng CourseDataMap  │
│     - Gom SV theo môn       │
│     - Lấy duration          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  5. Tìm maxCapacity         │
│     (Sức chứa phòng lớn nhất)│
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  6. Chia nhóm               │
│     For each course:        │
│     - Chia SV thành groups  │
│     - Mỗi group ≤ maxCapacity│
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  7. Tạo StudentGroupMap     │
│     - Map SV → ExamGroups   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  8. Lưu vào output.json     │
│     - Thêm metadata         │
│     - Format JSON           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────┐
│  output.json    │
│  (Output File)  │
└─────────────────┘
```

---

## 📝 Ví Dụ Chi Tiết

### Input (data.json):
```json
{
  "rawRegistrations": [
    { "studentId": "SV001", "courseCode": ["MH001", "MH002"] },
    { "studentId": "SV002", "courseCode": ["MH001"] },
    { "studentId": "SV003", "courseCode": ["MH001"] }
  ],
  "allRooms": [
    { "roomId": "P101", "capacity": 2, "location": "D9" }
  ],
  "allCourses": [
    { "courseCode": "MH001", "duration": 90 },
    { "courseCode": "MH002", "duration": 120 }
  ]
}
```

### Quá Trình Xử Lý:

**Bước 1: Transform data**
```javascript
rawRegistrations = [
  { studentId: "SV001", courseCode: "MH001" },
  { studentId: "SV001", courseCode: "MH002" },
  { studentId: "SV002", courseCode: "MH001" },
  { studentId: "SV003", courseCode: "MH001" }
]
```

**Bước 2: Build CourseDataMap**
```javascript
MH001 => { students: ["SV001", "SV002", "SV003"], duration: 90 }
MH002 => { students: ["SV001"], duration: 120 }
```

**Bước 3: maxCapacity = 2**

**Bước 4: Chia nhóm MH001**
```
MH001 có 3 SV, maxCapacity = 2
→ Group 1: SV001, SV002 (2 SV)
→ Group 2: SV003 (1 SV)
```

**Bước 5: Chia nhóm MH002**
```
MH002 có 1 SV, maxCapacity = 2
→ Group 1: SV001 (1 SV)
```

### Output (output.json):
```json
{
  "metadata": {
    "processedAt": "2025-10-28T10:30:00.000Z",
    "totalExamGroups": 3,
    "totalStudents": 3,
    "totalCourses": 2
  },
  "data": {
    "examGroups": [
      {
        "examGroupId": "MH001-G1",
        "courseCode": "MH001",
        "studentCount": 2,
        "duration": 90
      },
      {
        "examGroupId": "MH001-G2",
        "courseCode": "MH001",
        "studentCount": 1,
        "duration": 90
      },
      {
        "examGroupId": "MH002-G1",
        "courseCode": "MH002",
        "studentCount": 1,
        "duration": 120
      }
    ],
    "students": [
      {
        "studentId": "SV001",
        "examGroups": ["MH001-G1", "MH002-G1"]
      },
      {
        "studentId": "SV002",
        "examGroups": ["MH001-G1"]
      },
      {
        "studentId": "SV003",
        "examGroups": ["MH001-G2"]
      }
    ]
  }
}
```

---

## 🎯 Use Cases

### 1. Xử lý dữ liệu từ file
```bash
# Gọi API
curl http://localhost:3000/exam-grouping/process-data-file

# Kết quả được lưu vào output.json
# Có thể đọc lại file này để sử dụng cho bước tiếp theo
```

### 2. Tích hợp với Frontend
```javascript
async function processExamGroups() {
  try {
    const response = await fetch('/exam-grouping/process-data-file');
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Thành công!');
      console.log('Số nhóm thi:', result.data.examGroups.length);
      console.log('File output:', result.outputFile);
      
      // Hiển thị kết quả lên UI
      displayExamGroups(result.data.examGroups);
      displayStudents(result.data.students);
    } else {
      console.error('❌ Lỗi:', result.message);
    }
  } catch (error) {
    console.error('❌ Lỗi kết nối:', error);
  }
}
```

### 3. Sử dụng trong Pipeline
```javascript
// Bước 1: Chia nhóm thi
const groupingResult = await fetch('/exam-grouping/process-data-file')
  .then(res => res.json());

// Bước 2: Sử dụng kết quả để sắp xếp lịch thi
const schedulingResult = await fetch('/scheduling/generate-advanced', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    examGroups: groupingResult.data.examGroups,
    students: groupingResult.data.students,
    rooms: [...],
    proctors: [...]
  })
}).then(res => res.json());
```

---

## 🐛 Xử Lý Lỗi

### Lỗi: File không tồn tại
```json
{
  "success": false,
  "message": "Lỗi xử lý: File không tồn tại: /path/to/data.json",
  "outputFile": ""
}
```

**Giải pháp:** Kiểm tra file `data.json` có tồn tại trong thư mục module

### Lỗi: JSON không hợp lệ
```json
{
  "success": false,
  "message": "Lỗi xử lý: Unexpected token in JSON at position 123",
  "outputFile": ""
}
```

**Giải pháp:** Kiểm tra cú pháp JSON trong file `data.json`

### Lỗi: Không có phòng thi
```json
{
  "success": false,
  "message": "Lỗi xử lý: Không có phòng thi nào được cung cấp.",
  "outputFile": ""
}
```

**Giải pháp:** Thêm ít nhất 1 phòng thi vào `allRooms`

---

## 📌 Lưu Ý Quan Trọng

1. **File data.json phải tồn tại** trong cùng thư mục với service
2. **Định dạng JSON phải đúng** (không có trailing commas, quotes đúng)
3. **Hệ thống tự động xử lý typo** `corseCodes` → `courseCode`
4. **Output.json sẽ bị ghi đè** mỗi lần gọi API
5. **maxCapacity** được tính từ phòng có sức chứa lớn nhất

---

## 🔗 Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/exam-grouping/process-data-file` | Đọc data.json và lưu vào output.json |
| POST | `/exam-grouping/generate-groups` | Xử lý dữ liệu từ request body |

---

**Tác giả:** ExamScheduler Development Team  
**Cập nhật:** 28/10/2025
