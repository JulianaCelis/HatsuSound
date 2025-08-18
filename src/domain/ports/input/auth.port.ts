import { User } from '../../entities/user.entity';

// Tipo común para respuestas de usuario (sin password)
export type UserResponse = {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

// Puertos de entrada (Input Ports) - Lo que la aplicación expone al mundo exterior
export interface IAuthInputPort {
  register(request: RegisterRequest): Promise<Result<RegisterResponse, AuthError>>;
  login(request: LoginRequest): Promise<Result<LoginResponse, AuthError>>;
  refresh(refreshToken: string): Promise<Result<RefreshResponse, AuthError>>;
  logout(refreshToken: string): Promise<Result<LogoutResponse, AuthError>>;
  logoutAll(userId: string): Promise<Result<LogoutResponse, AuthError>>;
  getProfile(userId: string): Promise<Result<UserResponse, AuthError>>;
}

// Tipos de request/response
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface RegisterResponse {
  user: UserResponse;
  message: string;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserResponse;
}

export interface RefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LogoutResponse {
  message: string;
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

// Errores de dominio
export type AuthError = 
  | { type: 'VALIDATION_ERROR'; message: string }
  | { type: 'USER_NOT_FOUND'; message: string }
  | { type: 'INVALID_CREDENTIALS'; message: string }
  | { type: 'USER_ALREADY_EXISTS'; message: string }
  | { type: 'TOKEN_EXPIRED'; message: string }
  | { type: 'TOKEN_INVALID'; message: string }
  | { type: 'INSUFFICIENT_PERMISSIONS'; message: string }
  | { type: 'USER_INACTIVE'; message: string };

