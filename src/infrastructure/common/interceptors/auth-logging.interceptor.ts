import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class AuthLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuthLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as any; // Cast temporal para evitar errores de tipo
    const method = request.method;
    const url = request.url;
    const ip = request.ip || request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'];

    // Log request autenticado
    if (user && user.username && user.id) {
      this.logger.log(
        `Request autenticado: ${method} ${url} - Usuario: ${user.username} (${user.id}) - IP: ${ip} - UA: ${userAgent}`,
      );
    }

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        
        if (user && user.username) {
          this.logger.log(
            `Response autenticado: ${method} ${url} - Usuario: ${user.username} - Tiempo: ${responseTime}ms`,
          );
        }
      }),
    );
  }
}
