import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserService, USER_SERVICE } from '@/domain/services/user.service.interface';
import { User } from '@/domain/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: IUserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(emailOrUsername: string, password: string): Promise<any> {
    const user = await this.userService.validateUserCredentials(emailOrUsername, password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return user;
  }

  async login(user: User) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      username: user.username,
      role: user.role,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
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
