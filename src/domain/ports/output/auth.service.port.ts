import { User } from '../../entities/user.entity';

// Puertos de salida (Output Ports) - Servicios de autenticación
export interface IAuthServicePort {
  generateAccessToken(user: User): Promise<Result<string, AuthServiceError>>;
  generateRefreshToken(user: User, ipAddress?: string, userAgent?: string): Promise<Result<string, AuthServiceError>>;
  validateRefreshToken(token: string): Promise<Result<User, AuthServiceError>>;
  revokeRefreshToken(token: string): Promise<Result<boolean, AuthServiceError>>;
  revokeAllUserTokens(userId: string): Promise<Result<boolean, AuthServiceError>>;
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

// Errores del servicio de autenticación
export type AuthServiceError = 
  | { type: 'TOKEN_GENERATION_FAILED'; message: string }
  | { type: 'TOKEN_VALIDATION_FAILED'; message: string }
  | { type: 'TOKEN_REVOCATION_FAILED'; message: string }
  | { type: 'USER_NOT_FOUND'; message: string }
  | { type: 'TOKEN_EXPIRED'; message: string }
  | { type: 'TOKEN_INVALID'; message: string };

