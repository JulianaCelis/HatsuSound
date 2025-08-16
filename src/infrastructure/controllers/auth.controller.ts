import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBadRequestResponse, ApiConflictResponse, ApiUnauthorizedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegisterUseCase, LoginUseCase } from '@/application/use-cases/auth';
import { RegisterDto, LoginDto } from '../common/dtos/auth.dto';
import { UserResponseSchema } from '../common/schemas/user.schema';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Registrar nuevo usuario',
    description: 'Crea una nueva cuenta de usuario con email, username y contraseña'
  })
  @ApiBody({ 
    type: RegisterDto,
    description: 'Datos del usuario a registrar'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario registrado exitosamente',
    schema: {
      type: 'object',
      properties: {
        user: {
          $ref: '#/components/schemas/UserResponseSchema'
        },
        message: {
          type: 'string',
          example: 'Usuario registrado exitosamente'
        }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Datos inválidos o campos requeridos faltantes'
  })
  @ApiConflictResponse({ 
    description: 'Email o username ya existe'
  })
  async register(@Body() registerDto: RegisterDto) {
    return await this.registerUseCase.execute(registerDto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Iniciar sesión',
    description: 'Autentica al usuario con email/username y contraseña'
  })
  @ApiBody({ 
    type: LoginDto,
    description: 'Credenciales de acceso'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
        refresh_token: {
          type: 'string',
          example: 'refresh_token_here...'
        },
        token_type: {
          type: 'string',
          example: 'Bearer'
        },
        expires_in: {
          type: 'number',
          example: 1640995200
        },
        user: {
          $ref: '#/components/schemas/UserResponseSchema'
        }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Credenciales faltantes'
  })
  @ApiUnauthorizedResponse({ 
    description: 'Credenciales inválidas o usuario inactivo'
  })
  async login(@Request() req, @Body() loginDto: LoginDto) {
    const user = req.user;
    return await this.authService.login(user, req);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Renovar access token',
    description: 'Renueva el access token usando un refresh token válido'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refresh_token: {
          type: 'string',
          example: 'refresh_token_here...'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token renovado exitosamente',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
        token_type: {
          type: 'string',
          example: 'Bearer'
        },
        expires_in: {
          type: 'number',
          example: 1640995200
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'Refresh token inválido o expirado'
  })
  async refreshToken(@Body() body: { refresh_token: string }) {
    return await this.authService.refreshToken(body.refresh_token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Cerrar sesión',
    description: 'Revoca el refresh token actual'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refresh_token: {
          type: 'string',
          example: 'refresh_token_here...'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Logout exitoso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Logout exitoso'
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'No autorizado'
  })
  async logout(@Body() body: { refresh_token: string }) {
    const success = await this.authService.logout(body.refresh_token);
    return {
      message: success ? 'Logout exitoso' : 'Error en logout'
    };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Cerrar todas las sesiones',
    description: 'Revoca todos los refresh tokens del usuario'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Todas las sesiones cerradas',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Todas las sesiones han sido cerradas'
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'No autorizado'
  })
  async logoutAllSessions(@Request() req) {
    const success = await this.authService.logoutAllSessions(req.user.id);
    return {
      message: success ? 'Todas las sesiones han sido cerradas' : 'Error al cerrar sesiones'
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener perfil',
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
}
