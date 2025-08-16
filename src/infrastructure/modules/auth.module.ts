import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { LocalStrategy } from '../auth/strategies/local.strategy';
import { RefreshTokenService } from '../services/refresh-token.service';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { RefreshTokenEntity } from '../database/entities/refresh-token.entity';
import { UserModule } from './user.module';
import { RegisterUseCase, LoginUseCase } from '@/application/use-cases/auth';

@Module({
  imports: [
    UserModule,
    PassportModule,
    TypeOrmModule.forFeature([RefreshTokenEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshTokenService,
    RefreshTokenRepository,
    JwtStrategy,
    LocalStrategy,
    RegisterUseCase,
    LoginUseCase,
  ],
  exports: [AuthService, RefreshTokenService],
})
export class AuthModule {}
