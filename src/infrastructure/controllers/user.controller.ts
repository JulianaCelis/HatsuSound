import { Controller, Get, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetProfileUseCase } from '@/application/use-cases/auth';
import { UserResponseDto } from '../common/dtos/auth.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
  ) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Obtener perfil del usuario autenticado',
    description: 'Retorna la información del usuario autenticado (requiere JWT token)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        user: {
          $ref: '#/components/schemas/UserResponseDto'
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'Token JWT inválido o expirado',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Usuario no encontrado',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Usuario no encontrado' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  async getProfile(@Request() req) {
    return await this.getProfileUseCase.execute({ userId: req.user.id });
  }
}
