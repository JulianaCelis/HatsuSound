import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from '../database/entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  async save(refreshToken: RefreshTokenEntity): Promise<RefreshTokenEntity> {
    return await this.refreshTokenRepository.save(refreshToken);
  }

  async findByToken(token: string): Promise<RefreshTokenEntity | null> {
    return await this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<RefreshTokenEntity[]> {
    return await this.refreshTokenRepository.find({
      where: { userId },
      relations: ['user'],
    });
  }

  async revokeToken(token: string): Promise<boolean> {
    const result = await this.refreshTokenRepository.update(
      { token },
      { isRevoked: true }
    );
    return result.affected > 0;
  }

  async revokeAllUserTokens(userId: string): Promise<boolean> {
    const result = await this.refreshTokenRepository.update(
      { userId },
      { isRevoked: true }
    );
    return result.affected > 0;
  }

  async deleteExpiredTokens(): Promise<number> {
    const result = await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now: new Date() })
      .execute();
    return result.affected || 0;
  }

  async findValidTokenByUserId(userId: string): Promise<RefreshTokenEntity | null> {
    return await this.refreshTokenRepository.findOne({
      where: {
        userId,
        isRevoked: false,
        expiresAt: new Date(),
      },
      relations: ['user'],
    });
  }
}
