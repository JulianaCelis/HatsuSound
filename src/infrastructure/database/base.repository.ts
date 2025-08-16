import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IBaseRepository } from '@/domain/repositories/base.repository.interface';
import { BaseEntity as DomainBaseEntity } from '@/domain/entities/base.entity';
import { BaseEntity as InfrastructureBaseEntity } from './base.entity';

@Injectable()
export abstract class BaseRepository<T extends DomainBaseEntity, E extends InfrastructureBaseEntity> 
  implements IBaseRepository<T> {
  
  constructor(protected readonly repository: Repository<E>) {}

  abstract save(entity: T): Promise<T>;
  abstract findById(id: string): Promise<T | null>;
  abstract findAll(): Promise<T[]>;
  abstract update(id: string, entity: Partial<T>): Promise<T | null>;
  abstract delete(id: string): Promise<boolean>;

  protected abstract mapToEntity(domain: T): E;
  protected abstract mapToDomain(entity: E): T;
}
