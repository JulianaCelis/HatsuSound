import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class AuthExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AuthExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message = exception.message;

    // Log del error
    this.logger.error(
      `Error de autenticación: ${status} ${request.method} ${request.url} - ${message}`,
      exception.stack,
    );

    // Determinar si es un error de autenticación
    const isAuthError = status === HttpStatus.UNAUTHORIZED || 
                       status === HttpStatus.FORBIDDEN ||
                       message.includes('Unauthorized') ||
                       message.includes('Forbidden');

    if (isAuthError) {
      // Log adicional para errores de autenticación
      const user = (request as any).user;
      const ip = request.ip || request.connection.remoteAddress;
      
      this.logger.warn(
        `Intento de acceso no autorizado: ${request.method} ${request.url} - IP: ${ip} - Usuario: ${user && user.username ? user.username : 'No autenticado'}`,
      );
    }

    // Construir respuesta de error
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: isAuthError ? 'Acceso no autorizado' : message,
      ...(process.env.NODE_ENV === 'development' && {
        details: exception.getResponse(),
        stack: exception.stack,
      }),
    };

    response.status(status).json(errorResponse);
  }
}
