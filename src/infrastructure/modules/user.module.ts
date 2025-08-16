import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { UserEntity } from '../database/entities/user.entity';
import { GetProfileUseCase } from '@/application/use-cases/auth';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    GetProfileUseCase,
  ],
  exports: [UserService, UserRepository],
})
export class UserModule {}
