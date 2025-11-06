import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { Course } from '@modules/algorithm-input/course/entities/course.entity';

export class CourseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const coursesData = [
      {
        codeCourse: 'CT101',
        nameCourse: 'Nhập môn Công nghệ Thông tin',
        description:
          'Giới thiệu các khái niệm cơ bản về công nghệ thông tin, phần cứng, phần mềm và mạng máy tính.',
        duration_course_exam: 90,
        credits: 3,
        expected_students: 100,
        is_active: true,
      },
      {
        codeCourse: 'CT102',
        nameCourse: 'Lập trình C cơ bản',
        description:
          'Cung cấp kiến thức và kỹ năng lập trình cơ bản bằng ngôn ngữ C.',
        duration_course_exam: 90,
        credits: 3,
        expected_students: 80,
        is_active: true,
      },
      {
        codeCourse: 'CT201',
        nameCourse: 'Cấu trúc dữ liệu và Giải thuật',
        description:
          'Học về các cấu trúc dữ liệu cơ bản, thuật toán tìm kiếm và sắp xếp, ứng dụng trong lập trình.',
        duration_course_exam: 120,
        credits: 4,
        expected_students: 70,
        is_active: true,
      },
      {
        codeCourse: 'CT202',
        nameCourse: 'Cơ sở dữ liệu',
        description:
          'Giới thiệu các khái niệm về hệ quản trị cơ sở dữ liệu và ngôn ngữ SQL.',
        duration_course_exam: 120,
        credits: 3,
        expected_students: 90,
        is_active: true,
      },
      {
        codeCourse: 'CT301',
        nameCourse: 'Lập trình hướng đối tượng với Java',
        description:
          'Học khái niệm lập trình hướng đối tượng và cách triển khai bằng Java.',
        duration_course_exam: 120,
        credits: 3,
        expected_students: 85,
        is_active: true,
      },
      {
        codeCourse: 'CT302',
        nameCourse: 'Phát triển ứng dụng web',
        description:
          'Giới thiệu về HTML, CSS, JavaScript và các framework phổ biến để xây dựng web.',
        duration_course_exam: 90,
        credits: 3,
        expected_students: 60,
        is_active: true,
      },
      {
        codeCourse: 'CT401',
        nameCourse: 'Trí tuệ nhân tạo',
        description:
          'Giới thiệu các khái niệm cơ bản về trí tuệ nhân tạo và các ứng dụng thực tế.',
        duration_course_exam: 120,
        credits: 4,
        expected_students: 50,
        is_active: true,
      },
      {
        codeCourse: 'CT402',
        nameCourse: 'Phân tích và thiết kế hệ thống thông tin',
        description:
          'Phân tích yêu cầu, mô hình hóa và thiết kế hệ thống thông tin doanh nghiệp.',
        duration_course_exam: 120,
        credits: 3,
        expected_students: 60,
        is_active: true,
      },
    ];

    for (const data of coursesData) {
      const exist = await em.findOne(Course, { codeCourse: data.codeCourse });
      if (!exist) {
        const course = em.create(Course, data);
        await em.persistAndFlush(course);
        // console.log(`✅ Đã seed Course: ${course.nameCourse}`);
      }
    }
  }
}
