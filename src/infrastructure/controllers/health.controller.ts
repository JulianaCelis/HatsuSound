import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('api/health')
export class HealthController {
  @Get()
  @ApiOperation({ 
    summary: 'Health check endpoint',
    description: 'Verifica el estado de salud del servicio'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Servicio funcionando correctamente',
    schema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          example: 'ok',
          description: 'Estado del servicio'
        },
        timestamp: { 
          type: 'string', 
          example: '2025-08-18T17:00:00.000Z',
          description: 'Timestamp de la verificación'
        },
        uptime: { 
          type: 'number', 
          example: 123.456,
          description: 'Tiempo de actividad del servicio en segundos'
        },
        environment: {
          type: 'string',
          example: 'development',
          description: 'Entorno de ejecución'
        },
        version: {
          type: 'string',
          example: '1.0.0',
          description: 'Versión de la API'
        }
      }
    }
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    };
  }
}
