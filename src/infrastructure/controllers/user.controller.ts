import { Controller, Get, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';
import { UserResponseSchema } from '../common/schemas/user.schema';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor() {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener perfil del usuario',
    description: 'Obtiene el perfil del usuario autenticado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil obtenido exitosamente',
    type: UserResponseSchema
  })
  @ApiUnauthorizedResponse({ 
    description: 'No autorizado'
  })
  async getProfile(@Request() req) {
    return req.user;
  }

  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Endpoint solo para administradores',
    description: 'Solo usuarios con rol ADMIN pueden acceder'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Acceso permitido',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Acceso permitido para administradores'
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            role: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'No autorizado'
  })
  @ApiForbiddenResponse({ 
    description: 'Acceso denegado - Rol insuficiente'
  })
  async adminOnly(@Request() req) {
    return {
      message: 'Acceso permitido para administradores',
      user: {
        id: req.user.id,
        role: req.user.role
      }
    };
  }

  @Get('moderator-or-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Endpoint para moderadores y administradores',
    description: 'Usuarios con rol MODERATOR o ADMIN pueden acceder'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Acceso permitido',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Acceso permitido para moderadores y administradores'
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            role: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'No autorizado'
  })
  @ApiForbiddenResponse({ 
    description: 'Acceso denegado - Rol insuficiente'
  })
  async moderatorOrAdmin(@Request() req) {
    return {
      message: 'Acceso permitido para moderadores y administradores',
      user: {
        id: req.user.id,
        role: req.user.role
      }
    };
  }
}
