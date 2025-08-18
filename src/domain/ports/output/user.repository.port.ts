import { User } from '../../entities/user.entity';

// Puertos de salida (Output Ports) - Lo que la aplicación necesita del mundo exterior
export interface IUserRepositoryPort {
  save(user: User): Promise<Result<User, RepositoryError>>;
  findById(id: string): Promise<Result<User, RepositoryError>>;
  findByEmail(email: string): Promise<Result<User, RepositoryError>>;
  findByUsername(username: string): Promise<Result<User, RepositoryError>>;
  findByEmailOrUsername(emailOrUsername: string): Promise<Result<User, RepositoryError>>;
  findActiveUsers(): Promise<Result<User[], RepositoryError>>;
  findUsersByRole(role: string): Promise<Result<User[], RepositoryError>>;
  update(id: string, userData: Partial<User>): Promise<Result<User, RepositoryError>>;
  delete(id: string): Promise<Result<boolean, RepositoryError>>;
  isEmailUnique(email: string): Promise<Result<boolean, RepositoryError>>;
  isUsernameUnique(username: string): Promise<Result<boolean, RepositoryError>>;
}

// Railway Oriented Programming - Result type
export type Result<T, E> = Success<T> | Failure<E>;

export class Success<T> {
  readonly _tag = 'Success';
  constructor(readonly value: T) {}
  
  isSuccess(): this is Success<T> { return true; }
  isFailure(): this is Failure<never> { return false; }
}

export class Failure<E> {
  readonly _tag = 'Failure';
  constructor(readonly error: E) {}
  
  isSuccess(): this is Success<never> { return false; }
  isFailure(): this is Failure<E> { return true; }
}

// Errores del repositorio
export type RepositoryError = 
  | { type: 'ENTITY_NOT_FOUND'; message: string }
  | { type: 'DUPLICATE_ENTITY'; message: string }
  | { type: 'DATABASE_ERROR'; message: string }
  | { type: 'CONNECTION_ERROR'; message: string }
  | { type: 'VALIDATION_ERROR'; message: string };

