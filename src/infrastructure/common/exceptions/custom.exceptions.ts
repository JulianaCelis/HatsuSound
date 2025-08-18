import { HttpException, HttpStatus } from '@nestjs/common';

// Excepciones de autenticación
export class UnauthorizedException extends HttpException {
  constructor(message: string = 'No autorizado', details?: any) {
    super(
      {
        message,
        error: 'Unauthorized',
        statusCode: HttpStatus.UNAUTHORIZED,
        details,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Acceso denegado', details?: any) {
    super(
      {
        message,
        error: 'Forbidden',
        statusCode: HttpStatus.FORBIDDEN,
        details,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

// Excepciones de validación
export class ValidationException extends HttpException {
  constructor(message: string = 'Datos inválidos', details?: any) {
    super(
      {
        message,
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
        details,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

// Excepciones de recursos no encontrados
export class NotFoundException extends HttpException {
  constructor(message: string = 'Recurso no encontrado', details?: any) {
    super(
      {
        message,
        error: 'Not Found',
        statusCode: HttpStatus.NOT_FOUND,
        details,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

// Excepciones de conflictos
export class ConflictException extends HttpException {
  constructor(message: string = 'Conflicto', details?: any) {
    super(
      {
        message,
        error: 'Conflict',
        statusCode: HttpStatus.CONFLICT,
        details,
      },
      HttpStatus.CONFLICT,
    );
  }
}

// Excepciones de rate limiting
export class TooManyRequestsException extends HttpException {
  constructor(message: string = 'Demasiadas solicitudes', details?: any) {
    super(
      {
        message,
        error: 'Too Many Requests',
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        details,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

// Excepciones de servidor
export class InternalServerErrorException extends HttpException {
  constructor(message: string = 'Error interno del servidor', details?: any) {
    super(
      {
        message,
        error: 'Internal Server Error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        details,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

