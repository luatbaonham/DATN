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

  async findAll(): Promise<User[]> {
    return this.em.find(User, {}, { populate: ['userRoles.role'] });
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
      { populate: ['userRoles.role', 'student.class', 'lecturer.department'] },
    );

    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    const roles = user.userRoles.getItems().map((ur) => ur.role.name);

    const baseProfile = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
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
        class: user.student.class?.className,
      };
    }

    if (roles.includes('GIANG_VIEN') && user.lecturer) {
      return {
        ...baseProfile,
        lecturerCode: user.lecturer.lecturerCode,
        department: user.lecturer.department?.departmentName,
        isSupervisor: user.lecturer.isSupervisor,
      };
    }

    return baseProfile;
  }
}
