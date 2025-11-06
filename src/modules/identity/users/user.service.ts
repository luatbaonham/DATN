import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserFilterDto } from './dto/user-filter.dto';
import { plainToInstance } from 'class-transformer';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateUserDto): Promise<User> {
    const exist_email = await this.em.findOne(User, { email: dto.email });
    if (exist_email) {
      throw new ConflictException('Email da ton tai!');
    }

    const user = this.em.create(User, dto);
    user.password = await bcrypt.hash(dto.password, 10);
    await this.em.persistAndFlush(user);
    return user;
  }

  async findAll(filter: UserFilterDto) {
    const { page = 1, limit = 10, fullName, email, role } = filter;
    const offset = (page - 1) * limit;

    // ⚙️ Base query
    const qb = this.em
      .createQueryBuilder(User, 'u')
      .leftJoinAndSelect('u.userRoles', 'ur')
      .leftJoinAndSelect('ur.role', 'r');

    // 🔍 Filter tên thì sẽ đổi qua ở sv,gv
    // if (fullName) {
    //   qb.andWhere(
    //     `LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE LOWER(?)`,
    //     [`%${fullName}%`],
    //   );
    // }

    if (email) {
      qb.andWhere(`LOWER(u.email) LIKE LOWER(?)`, [`%${email}%`]);
    }

    if (role) {
      qb.andWhere(
        `u.id IN (
       SELECT ur2.user_id 
       FROM user_role ur2 
       JOIN role r2 ON ur2.role_id = r2.id 
       WHERE LOWER(r2.name) LIKE LOWER(?)
     )`,
        [`%${role}%`],
      );
    }

    qb.orderBy({ 'u.createdAt': 'DESC' }).limit(limit).offset(offset);

    // ⚡ Load dữ liệu
    const [users, total] = await qb.getResultAndCount();

    // 🔄 Map dữ liệu ra DTO
    const data = users.map((u) => ({
      id: u.id,
      // firstName: u.firstName,
      // lastName: u.lastName,
      email: u.email,
      roles:
        u.userRoles
          ?.getItems()
          .filter((ur) => ur.role)
          .map((ur) => ({
            id: ur.role!.id,
            name: ur.role!.name,
            description: ur.role!.description,
          })) ?? [],
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    const mapped = plainToInstance(UserResponseDto, data, {
      excludeExtraneousValues: true,
    });

    // 📦 Trả về dạng chuẩn PaginatedResponseDto
    return PaginatedResponseDto.from(mapped, page, limit, total);
  }

  async findOne(id: number): Promise<User | null> {
    return this.em.findOne(User, { id });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    const user = await this.em.findOne(User, { id });
    if (!user) return null;

    const cleanDto = Object.fromEntries(
      Object.entries(updateUserDto).filter(([_, v]) => v !== undefined),
    );

    if (cleanDto['password']) {
      cleanDto['password'] = await bcrypt.hash(cleanDto['password'], 10);
    }

    this.em.assign(user, cleanDto);
    await this.em.persistAndFlush(user);
    return user;
  }

  async remove(id: number): Promise<boolean> {
    const user = await this.em.findOne(User, { id });
    if (!user) return false;

    await this.em.removeAndFlush(user);
    return true;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.em.findOne(
      User,
      { email },
      { populate: ['roles' as keyof User] },
    );
  }

  async getProfileByUserId(userId: number): Promise<any> {
    const user = await this.em.findOne(
      User,
      { id: userId },
      {
        populate: ['userRoles.role', 'student.classes', 'lecturer.department'],
      },
    );

    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    const roles = user.userRoles.getItems().map((ur) => ur.role.name);

    const baseProfile = {
      id: user.id,
      email: user.email,
      // firstName: user.firstName,
      // lastName: user.lastName,
      roles,
    };

    if (roles.includes('SINH_VIEN') && user.student) {
      return {
        ...baseProfile,
        studentCode: user.student.studentCode,
        dateOfBirth: user.student.dateOfBirth,
        gender: user.student.gender,
        address: user.student.address,
        phoneNumber: user.student.phoneNumber,
        class: user.student.classes?.className,
      };
    }

    if (roles.includes('GIANG_VIEN') && user.lecturer) {
      return {
        ...baseProfile,
        lecturerCode: user.lecturer.lecturerCode,
        department: user.lecturer.department?.departmentName,
      };
    }

    return baseProfile;
  }
}
