import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { IUserService } from '@/domain/services/user.service.interface';
import { User } from '@/domain/entities/user.entity';

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  user: Omit<User, 'password'>;
  message: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(private readonly userService: IUserService) {}

  async execute(request: RegisterRequest): Promise<RegisterResponse> {
    const { email, username, password, firstName, lastName } = request;

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
    );

    // Retornar usuario sin password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as Omit<User, 'password'>,
      message: 'Usuario registrado exitosamente',
    };
  }
}
