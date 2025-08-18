import { User } from '../../entities/user.entity';

// Puertos de salida (Output Ports) - Servicios de dominio
export interface IUserServicePort {
  createUser(
    email: string,
    username: string,
    password: string,
    firstName: string,
    lastName: string,
    role?: string,
  ): Promise<Result<User, ServiceError>>;
  
  getUserById(id: string): Promise<Result<User, ServiceError>>;
  getUserByEmail(email: string): Promise<Result<User, ServiceError>>;
  getUserByUsername(username: string): Promise<Result<User, ServiceError>>;
  
  updateUser(id: string, userData: Partial<User>): Promise<Result<User, ServiceError>>;
  deleteUser(id: string): Promise<Result<boolean, ServiceError>>;
  
  validateUserCredentials(emailOrUsername: string, password: string): Promise<Result<User, ServiceError>>;
  activateUser(id: string): Promise<Result<User, ServiceError>>;
  deactivateUser(id: string): Promise<Result<User, ServiceError>>;
  changeUserRole(id: string, role: string): Promise<Result<User, ServiceError>>;
  
  isEmailUnique(email: string): Promise<Result<boolean, ServiceError>>;
  isUsernameUnique(username: string): Promise<Result<boolean, ServiceError>>;
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

// Errores del servicio
export type ServiceError = 
  | { type: 'USER_NOT_FOUND'; message: string }
  | { type: 'INVALID_PASSWORD'; message: string }
  | { type: 'USER_INACTIVE'; message: string }
  | { type: 'INVALID_ROLE'; message: string }
  | { type: 'VALIDATION_ERROR'; message: string }
  | { type: 'BUSINESS_RULE_VIOLATION'; message: string };

