import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserService, USER_SERVICE } from '@/domain/services/user.service.interface';
import { User } from '@/domain/entities/user.entity';
import { RefreshTokenService } from './refresh-token.service';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: IUserService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async validateUser(emailOrUsername: string, password: string): Promise<any> {
    const user = await this.userService.validateUserCredentials(emailOrUsername, password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return user;
  }

  async login(user: User, req?: Request) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      username: user.username,
      role: user.role,
    };
    
    // Generar access token
    const accessToken = this.jwtService.sign(payload);
    
    // Generar refresh token
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user as any, // Cast temporal para UserEntity
      req?.ip,
      req?.headers['user-agent']
    );
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: this.jwtService.decode(accessToken)['exp'],
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        isActive: user.isActive,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    const user = await this.refreshTokenService.validateRefreshToken(refreshToken);
    const newAccessToken = await this.refreshTokenService.generateNewAccessToken(refreshToken);
    
    return {
      access_token: newAccessToken,
      token_type: 'Bearer',
      expires_in: this.jwtService.decode(newAccessToken)['exp'],
    };
  }

  async logout(refreshToken: string): Promise<boolean> {
    return await this.refreshTokenService.revokeRefreshToken(refreshToken);
  }

  async logoutAllSessions(userId: string): Promise<boolean> {
    return await this.refreshTokenService.revokeAllUserTokens(userId);
  }

  async generateToken(user: User): Promise<string> {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      username: user.username,
      role: user.role,
    };
    
    return this.jwtService.sign(payload);
  }
}
