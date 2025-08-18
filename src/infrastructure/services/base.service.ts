import { IBaseService } from '@/domain/services/base.service.interface';
import { IBaseRepository } from '@/domain/repositories/base.repository.interface';
import { BaseEntity } from '@/domain/entities/base.entity';

export abstract class BaseService<T extends BaseEntity> implements IBaseService<T> {
  constructor(protected readonly repository: IBaseRepository<T>) {}

  async create(entityData: Partial<T>): Promise<T> {
    const entity = this.createEntity(entityData);
    return await this.repository.save(entity);
  }

  async findById(id: string): Promise<T | null> {
    return await this.repository.findById(id);
  }

  async findAll(): Promise<T[]> {
    return await this.repository.findAll();
  }

  async update(id: string, entityData: Partial<T>): Promise<T | null> {
    return await this.repository.update(id, entityData);
  }

  async delete(id: string): Promise<boolean> {
    return await this.repository.delete(id);
  }

  protected abstract createEntity(entityData: Partial<T>): T;
}

