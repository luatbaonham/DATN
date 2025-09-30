import { ConflictException, Injectable } from '@nestjs/common';
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
}
