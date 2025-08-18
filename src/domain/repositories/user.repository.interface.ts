import { User } from '../entities/user.entity';

export interface IUserRepository {
  save(entity: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: string, entity: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  
  // Métodos específicos de usuario
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmailOrUsername(emailOrUsername: string): Promise<User | null>;
  findActiveUsers(): Promise<User[]>;
  findUsersByRole(role: string): Promise<User[]>;
}
