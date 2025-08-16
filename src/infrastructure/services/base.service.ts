import { Injectable } from '@nestjs/common';
import { IBaseService } from '@/domain/services/base.service.interface';
import { BaseEntity } from '@/domain/entities/base.entity';
import { IBaseRepository } from '@/domain/repositories/base.repository.interface';

@Injectable()
export abstract class BaseService<T extends BaseEntity> implements IBaseService<T> {
  constructor(protected readonly repository: IBaseRepository<T>) {}

  abstract create(data: any): Promise<T>;
  abstract getById(id: string): Promise<T | null>;
  abstract getAll(): Promise<T[]>;
  abstract update(id: string, data: any): Promise<T | null>;
  abstract delete(id: string): Promise<boolean>;
}
