import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredTokens() {
    try {
      this.logger.log('Iniciando limpieza de tokens expirados...');
      
      const deletedCount = await this.refreshTokenService.cleanupExpiredTokens();
      
      this.logger.log(`Limpieza completada. ${deletedCount} tokens expirados eliminados.`);
    } catch (error) {
      this.logger.error('Error durante la limpieza de tokens:', error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async hourlyCleanup() {
    try {
      const deletedCount = await this.refreshTokenService.cleanupExpiredTokens();
      
      if (deletedCount > 0) {
        this.logger.log(`Limpieza horaria: ${deletedCount} tokens expirados eliminados.`);
      }
    } catch (error) {
      this.logger.error('Error durante la limpieza horaria:', error);
    }
  }
}
