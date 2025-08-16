import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@/domain/entities/user.entity';

export class UserResponseSchema {
  @ApiProperty({ 
    example: 'uuid-string', 
    description: 'ID único del usuario',
    type: String
  })
  id: string;

  @ApiProperty({ 
    example: 'user@example.com', 
    description: 'Email del usuario',
    type: String
  })
  email: string;

  @ApiProperty({ 
    example: 'username123', 
    description: 'Nombre de usuario',
    type: String
  })
  username: string;

  @ApiProperty({ 
    example: 'John', 
    description: 'Nombre del usuario',
    type: String
  })
  firstName: string;

  @ApiProperty({ 
    example: 'Doe', 
    description: 'Apellido del usuario',
    type: String
  })
  lastName: string;

  @ApiProperty({ 
    example: 'John Doe', 
    description: 'Nombre completo',
    type: String
  })
  fullName: string;

  @ApiProperty({ 
    example: true, 
    description: 'Estado activo del usuario',
    type: Boolean
  })
  isActive: boolean;

  @ApiProperty({ 
    example: UserRole.USER, 
    description: 'Rol del usuario',
    enum: UserRole,
    type: String
  })
  role: UserRole;

  @ApiProperty({ 
    example: '2024-01-01T00:00:00.000Z', 
    description: 'Fecha de creación',
    type: Date
  })
  createdAt: Date;

  @ApiProperty({ 
    example: '2024-01-01T00:00:00.000Z', 
    description: 'Fecha de última actualización',
    type: Date
  })
  updatedAt: Date;
}
