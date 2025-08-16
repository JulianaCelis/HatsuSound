import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private store: RateLimitStore = {};
  private readonly windowMs = 15 * 60 * 1000; // 15 minutos
  private readonly maxRequests = 100; // 100 requests por ventana

  use(req: Request, res: Response, next: NextFunction) {
    const key = this.getKey(req);
    const now = Date.now();

    // Limpiar entradas expiradas
    this.cleanup();

    if (!this.store[key]) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }

    // Si la ventana ha expirado, resetear
    if (now > this.store[key].resetTime) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }

    // Incrementar contador
    this.store[key].count++;

    // Verificar límite
    if (this.store[key].count > this.maxRequests) {
      throw new HttpException(
        'Too Many Requests - Rate limit exceeded',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Agregar headers de rate limit
    res.setHeader('X-RateLimit-Limit', this.maxRequests);
    res.setHeader('X-RateLimit-Remaining', this.maxRequests - this.store[key].count);
    res.setHeader('X-RateLimit-Reset', this.store[key].resetTime);

    next();
  }

  private getKey(req: Request): string {
    // Usar IP del usuario como clave
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Para endpoints de auth, usar IP + endpoint
    if (req.path.includes('/auth/')) {
      return `${ip}:${req.path}`;
    }
    
    return ip;
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
