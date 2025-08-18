import { BaseEntity } from '../entities/base.entity';

export interface IBaseService<T extends BaseEntity> {
  create(entityData: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  update(id: string, entityData: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

