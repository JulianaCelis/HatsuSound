import { BaseEntity } from '../entities/base.entity';

export interface IBaseService<T extends BaseEntity> {
  create(data: any): Promise<T>;
  getById(id: string): Promise<T | null>;
  getAll(): Promise<T[]>;
  update(id: string, data: any): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}
