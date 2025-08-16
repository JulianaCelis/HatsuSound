import { Injectable, BadRequestException, ConflictException, Inject } from '@nestjs/common';
import { IUserService, USER_SERVICE } from '@/domain/services/user.service.interface';
import { User } from '@/domain/entities/user.entity';

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string; // Rol opcional
}

export interface RegisterResponse {
  user: Omit<User, 'password'>;
  message: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: IUserService
  ) {}

  async execute(request: RegisterRequest): Promise<RegisterResponse> {
    const { email, username, password, firstName, lastName, role } = request;

    // Validaciones de negocio
    if (!email || !username || !password || !firstName || !lastName) {
      throw new BadRequestException('Todos los campos son requeridos');
    }

    if (password.length < 6) {
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');
    }

    // Verificar unicidad de email y username
    const isEmailUnique = await this.userService.isEmailUnique(email);
    if (!isEmailUnique) {
      throw new ConflictException('El email ya está registrado');
    }

    const isUsernameUnique = await this.userService.isUsernameUnique(username);
    if (!isUsernameUnique) {
      throw new ConflictException('El username ya está en uso');
    }

    // Crear usuario
    const user = await this.userService.createUser(
      email,
      username,
      password,
      firstName,
      lastName,
      role as any, // Pasar el rol del request
    );

    // Retornar usuario sin password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as Omit<User, 'password'>,
      message: 'Usuario registrado exitosamente',
    };
  }
}
