import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TooManyRequestsException } from '../exceptions/custom.exceptions';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private store: { [key: string]: { count: number; resetTime: number; } } = {};
  private readonly windowMs = 15 * 60 * 1000; // 15 minutos
  private readonly maxRequests = 100; // 100 requests por ventana

  use(req: Request, res: Response, next: NextFunction) {
    const key = this.getKey(req);
    const now = Date.now();

    // Limpiar entradas expiradas
    this.cleanup();

    // Obtener o crear entrada para esta IP
    if (!this.store[key]) {
      this.store[key] = { count: 0, resetTime: now + this.windowMs };
    }

    // Verificar si la ventana de tiempo ha expirado
    if (now > this.store[key].resetTime) {
      this.store[key] = { count: 1, resetTime: now + this.windowMs };
      next();
      return;
    }

    // Incrementar contador
    this.store[key].count++;

    // Verificar límite
    if (this.store[key].count > this.maxRequests) {
      // Agregar headers de rate limit
      res.set('X-RateLimit-Limit', this.maxRequests.toString());
      res.set('X-RateLimit-Remaining', '0');
      res.set('X-RateLimit-Reset', new Date(this.store[key].resetTime).toISOString());
      
      throw new TooManyRequestsException(
        `Has excedido el límite de ${this.maxRequests} requests por ${this.windowMs / 60000} minutos`,
        {
          limit: this.maxRequests,
          windowMs: this.windowMs,
          retryAfter: Math.ceil((this.store[key].resetTime - now) / 1000),
        }
      );
    }

    // Agregar headers de rate limit
    res.set('X-RateLimit-Limit', this.maxRequests.toString());
    res.set('X-RateLimit-Remaining', (this.maxRequests - this.store[key].count).toString());
    res.set('X-RateLimit-Reset', new Date(this.store[key].resetTime).toISOString());

    next();
  }

  private getKey(req: Request): string {
    // Usar IP del usuario como clave
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    });
  }
}
