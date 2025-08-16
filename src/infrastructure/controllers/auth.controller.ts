import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBadRequestResponse, ApiConflictResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { RegisterUseCase, LoginUseCase } from '@/application/use-cases/auth';
import { RegisterDto, LoginDto, UserResponseDto } from '../common/dtos/auth.dto';

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
          $ref: '#/components/schemas/UserResponseDto'
        },
        message: {
          type: 'string',
          example: 'Usuario registrado exitosamente'
        }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Datos inválidos o campos requeridos faltantes',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['Email es requerido', 'Username debe tener al menos 3 caracteres']
        },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiConflictResponse({ 
    description: 'Email o username ya existe',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'El email ya está registrado' },
        error: { type: 'string', example: 'Conflict' }
      }
    }
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
        user: {
          $ref: '#/components/schemas/UserResponseDto'
        }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Credenciales faltantes',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Email/username y contraseña son requeridos' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'Credenciales inválidas o usuario inactivo',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Credenciales inválidas' },
        error: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  async login(@Request() req, @Body() loginDto: LoginDto) {
    const user = req.user;
    return await this.authService.login(user);
  }
}
