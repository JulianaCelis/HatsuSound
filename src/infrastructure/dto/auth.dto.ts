import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email del usuario' })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @ApiProperty({ example: 'username123', description: 'Nombre de usuario' })
  @IsString({ message: 'Username debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'Username es requerido' })
  @MinLength(3, { message: 'Username debe tener al menos 3 caracteres' })
  username: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña' })
  @IsString({ message: 'Password debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'Password es requerido' })
  @MinLength(6, { message: 'Password debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ example: 'John', description: 'Nombre del usuario' })
  @IsString({ message: 'FirstName debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'FirstName es requerido' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Apellido del usuario' })
  @IsString({ message: 'LastName debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'LastName es requerido' })
  lastName: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email o username del usuario' })
  @IsString({ message: 'EmailOrUsername debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'EmailOrUsername es requerido' })
  emailOrUsername: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña del usuario' })
  @IsString({ message: 'Password debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'Password es requerido' })
  password: string;
}
