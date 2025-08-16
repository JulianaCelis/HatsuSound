import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { IUserService } from '@/domain/services/user.service.interface';
import { User } from '@/domain/entities/user.entity';

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  message: string;
}

@Injectable()
export class LoginUseCase {
  constructor(private readonly userService: IUserService) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    const { emailOrUsername, password } = request;

    // Validaciones básicas
    if (!emailOrUsername || !password) {
      throw new BadRequestException('Email/username y contraseña son requeridos');
    }

    // Validar credenciales
    const user = await this.userService.validateUserCredentials(emailOrUsername, password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Retornar usuario sin password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as Omit<User, 'password'>,
      accessToken: 'JWT_TOKEN_WILL_BE_GENERATED_HERE', // Se generará en el servicio de auth
      message: 'Login exitoso',
    };
  }
}
