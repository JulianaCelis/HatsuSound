import { Repository, EntityTarget, DataSource } from 'typeorm';
import { BaseEntity } from './base.entity';
import { IBaseRepository } from '@/domain/repositories/base.repository.interface';

export abstract class BaseRepository<T extends BaseEntity> implements IBaseRepository<T> {
  protected repository: Repository<T>;

  constructor(
    private readonly entity: EntityTarget<T>,
    private readonly dataSource: DataSource
  ) {
    this.repository = this.dataSource.getRepository(this.entity);
  }

  async save(entity: T): Promise<T> {
    return await this.repository.save(entity);
  }

  async findById(id: string): Promise<T | null> {
    return await this.repository.findOne({ where: { id } as any });
  }

  async findAll(): Promise<T[]> {
    return await this.repository.find();
  }

  async update(id: string, entityData: Partial<T>): Promise<T | null> {
    await this.repository.update(id, entityData as any);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}

