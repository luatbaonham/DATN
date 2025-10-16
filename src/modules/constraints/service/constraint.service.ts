import { Constraint } from '../entities/constraint.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateConstraintDto } from '../dto/create-constraint.dto';
import { UpdateConstraintDto } from '../dto/update-constraint.dto';
import { EntityManager } from '@mikro-orm/mysql';

@Injectable()
export class ConstraintService {
  constructor(private readonly em: EntityManager) {}

  async findAll(): Promise<Constraint[]> {
    return this.em.find(Constraint, {}, { populate: ['rules'] });
  }

  async findOne(id: number): Promise<Constraint> {
    const item = await this.em.findOne(
      Constraint,
      { id },
      { populate: ['rules'] },
    );
    if (!item) throw new NotFoundException('Constraint không tồn tại');
    return item;
  }

  async create(dto: CreateConstraintDto): Promise<Constraint> {
    // Kiểm tra trùng mã ràng buộc
    const existing = await this.em.findOne(Constraint, {
      constraintCode: dto.constraintCode,
    });

    if (existing) {
      throw new BadRequestException('Mã ràng buộc đã tồn tại');
    }

    // Nếu không trùng thì tạo mới
    const constraint = this.em.create(Constraint, dto);
    await this.em.persistAndFlush(constraint);

    return constraint;
  }

  async update(id: number, dto: UpdateConstraintDto): Promise<Constraint> {
    const constraint = await this.findOne(id);

    if (dto.constraintCode) {
      const existing = await this.em.findOne(Constraint, {
        constraintCode: dto.constraintCode,
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException('Mã ràng buộc đã tồn tại');
      }
    }

    const cleanDto = Object.fromEntries(
      Object.entries(dto).filter(([_, v]) => v !== undefined),
    );

    this.em.assign(constraint, cleanDto);
    await this.em.persistAndFlush(constraint);
    return constraint;
  }

  async remove(id: number) {
    const constraint = await this.findOne(id);
    await this.em.remove(constraint);
    return { message: 'Đã xóa Constraint thành công' };
  }
}
