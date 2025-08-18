import { Injectable, Inject } from '@nestjs/common';
import { 
  IAuthInputPort, 
  RegisterRequest, 
  RegisterResponse, 
  Result, 
  Success, 
  Failure,
  AuthError 
} from '@/domain/ports';
import { IUserServicePort } from '@/domain/ports/output/user.service.port';
import { USER_SERVICE } from '@/domain/services/user.service.interface';

@Injectable()
export class RegisterUseCaseHexagonal implements IAuthInputPort {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: IUserServicePort
  ) {}

  async register(request: RegisterRequest): Promise<Result<RegisterResponse, AuthError>> {
    // Railway Oriented Programming - Success Track
    try {
      // 1. Validar request
      const validationResult = this.validateRequest(request);
      if (validationResult.isFailure()) {
        return validationResult;
      }

      // 2. Verificar unicidad
      const uniquenessResult = await this.verifyUniqueness(request);
      if (uniquenessResult.isFailure()) {
        return uniquenessResult;
      }

      // 3. Crear usuario
      const userResult = await this.userService.createUser(
        request.email,
        request.username,
        request.password,
        request.firstName,
        request.lastName,
        request.role
      );

      if (userResult.isFailure()) {
        return new Failure({
          type: 'VALIDATION_ERROR',
          message: 'Error al crear usuario: ' + userResult.error.message
        });
      }

      // 4. Preparar respuesta
      const { password: _, ...userWithoutPassword } = userResult.value;
      
      return new Success({
        user: {
          id: userWithoutPassword.id,
          email: userWithoutPassword.email,
          username: userWithoutPassword.username,
          firstName: userWithoutPassword.firstName,
          lastName: userWithoutPassword.lastName,
          isActive: userWithoutPassword.isActive,
          role: userWithoutPassword.role,
          createdAt: userWithoutPassword.createdAt,
          updatedAt: userWithoutPassword.updatedAt
        },
        message: 'Usuario registrado exitosamente'
      });

    } catch (error) {
      // Railway Oriented Programming - Failure Track
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error interno del servidor: ' + error.message
      });
    }
  }

  // Métodos auxiliares que implementan la lógica de negocio
  private validateRequest(request: RegisterRequest): Result<void, AuthError> {
    if (!request.email || !request.username || !request.password || !request.firstName || !request.lastName) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Todos los campos son requeridos'
      });
    }

    if (request.password.length < 6) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    if (request.username.length < 3) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'El username debe tener al menos 3 caracteres'
      });
    }

    return new Success(undefined);
  }

  private async verifyUniqueness(request: RegisterRequest): Promise<Result<void, AuthError>> {
    const emailUniqueResult = await this.userService.isEmailUnique(request.email);
    if (emailUniqueResult.isFailure()) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al verificar email: ' + emailUniqueResult.error.message
      });
    }

    if (!emailUniqueResult.value) {
      return new Failure({
        type: 'USER_ALREADY_EXISTS',
        message: 'El email ya está registrado'
      });
    }

    const usernameUniqueResult = await this.userService.isUsernameUnique(request.username);
    if (usernameUniqueResult.isFailure()) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al verificar username: ' + usernameUniqueResult.error.message
      });
    }

    if (!usernameUniqueResult.value) {
      return new Failure({
        type: 'USER_ALREADY_EXISTS',
        message: 'El username ya está en uso'
      });
    }

    return new Success(undefined);
  }

  // Implementación de otros métodos del puerto (placeholder)
  async login(request: any): Promise<Result<any, AuthError>> {
    throw new Error('Not implemented');
  }

  async refresh(refreshToken: string): Promise<Result<any, AuthError>> {
    throw new Error('Not implemented');
  }

  async logout(refreshToken: string): Promise<Result<any, AuthError>> {
    throw new Error('Not implemented');
  }

  async logoutAll(userId: string): Promise<Result<any, AuthError>> {
    throw new Error('Not implemented');
  }

  async getProfile(userId: string): Promise<Result<any, AuthError>> {
    throw new Error('Not implemented');
  }
}


