import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { RefreshTokenEntity } from '../database/entities/refresh-token.entity';
import { UserEntity } from '../database/entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateRefreshToken(user: UserEntity, ipAddress?: string, userAgent?: string): Promise<string> {
    // Generar token aleatorio
    const token = crypto.randomBytes(64).toString('hex');
    
    // Calcular fecha de expiración (30 días por defecto)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Crear entidad de refresh token
    const refreshToken = new RefreshTokenEntity();
    refreshToken.token = token;
    refreshToken.userId = user.id;
    refreshToken.expiresAt = expiresAt;
    refreshToken.isRevoked = false;
    refreshToken.ipAddress = ipAddress;
    refreshToken.userAgent = userAgent;

    // Guardar en BD
    await this.refreshTokenRepository.save(refreshToken);

    return token;
  }

  async validateRefreshToken(token: string): Promise<UserEntity> {
    const refreshToken = await this.refreshTokenRepository.findByToken(token);
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    if (refreshToken.isRevoked) {
      throw new UnauthorizedException('Refresh token revocado');
    }

    if (refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expirado');
    }

    return refreshToken.user;
  }

  async revokeRefreshToken(token: string): Promise<boolean> {
    return await this.refreshTokenRepository.revokeToken(token);
  }

  async revokeAllUserTokens(userId: string): Promise<boolean> {
    return await this.refreshTokenRepository.revokeAllUserTokens(userId);
  }

  async generateNewAccessToken(refreshToken: string): Promise<string> {
    const user = await this.validateRefreshToken(refreshToken);
    
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  async cleanupExpiredTokens(): Promise<number> {
    return await this.refreshTokenRepository.deleteExpiredTokens();
  }
}
