import { BaseEntity } from '../entities/base.entity';
import { User } from '../entities/user.entity';

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmailOrUsername(emailOrUsername: string): Promise<User | null>;
  findActiveUsers(): Promise<User[]>;
  findUsersByRole(role: string): Promise<User[]>;
}

// Extend from base repository interface
export interface IBaseRepository<T extends BaseEntity> {
  save(entity: T): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  update(id: string, entity: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}
