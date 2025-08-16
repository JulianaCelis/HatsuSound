import { IsEmail, IsString, MinLength, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@/domain/entities/user.entity';

export class RegisterDto {
  @ApiProperty({ 
    example: 'user@example.com', 
    description: 'Email del usuario (debe ser único)',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @ApiProperty({ 
    example: 'username123', 
    description: 'Nombre de usuario (debe ser único, mínimo 3 caracteres)',
    minLength: 3,
    maxLength: 50
  })
  @IsString({ message: 'Username debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'Username es requerido' })
  @MinLength(3, { message: 'Username debe tener al menos 3 caracteres' })
  username: string;

  @ApiProperty({ 
    example: 'password123', 
    description: 'Contraseña (mínimo 6 caracteres)',
    minLength: 6
  })
  @IsString({ message: 'Password debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'Password es requerido' })
  @MinLength(6, { message: 'Password debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ 
    example: 'John', 
    description: 'Nombre del usuario',
    maxLength: 100
  })
  @IsString({ message: 'FirstName debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'FirstName es requerido' })
  firstName: string;

  @ApiProperty({ 
    example: 'Doe', 
    description: 'Apellido del usuario',
    maxLength: 100
  })
  @IsString({ message: 'LastName debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'LastName es requerido' })
  lastName: string;

  @ApiPropertyOptional({ 
    example: UserRole.USER, 
    description: 'Rol del usuario (por defecto: user)',
    enum: UserRole,
    default: UserRole.USER
  })
  @IsEnum(UserRole, { message: 'Rol inválido' })
  role?: UserRole;
}

export class LoginDto {
  @ApiProperty({ 
    example: 'user@example.com', 
    description: 'Email o username del usuario'
  })
  @IsString({ message: 'EmailOrUsername debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'EmailOrUsername es requerido' })
  emailOrUsername: string;

  @ApiProperty({ 
    example: 'password123', 
    description: 'Contraseña del usuario'
  })
  @IsString({ message: 'Password debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'Password es requerido' })
  password: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 'uuid-string', description: 'ID único del usuario' })
  id: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email del usuario' })
  email: string;

  @ApiProperty({ example: 'username123', description: 'Nombre de usuario' })
  username: string;

  @ApiProperty({ example: 'John', description: 'Nombre del usuario' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Apellido del usuario' })
  lastName: string;

  @ApiProperty({ example: 'John Doe', description: 'Nombre completo' })
  fullName: string;

  @ApiProperty({ example: true, description: 'Estado activo del usuario' })
  isActive: boolean;

  @ApiProperty({ 
    example: UserRole.USER, 
    description: 'Rol del usuario',
    enum: UserRole
  })
  role: UserRole;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Fecha de última actualización' })
  updatedAt: Date;
}
