import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { UserEntity } from '../database/entities/user.entity';
import { GetProfileUseCase } from '@/application/use-cases/auth';
import { USER_SERVICE } from '@/domain/services/user.service.interface';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    {
      provide: USER_SERVICE,
      useClass: UserService,
    },
    GetProfileUseCase,
  ],
  exports: [UserService, UserRepository, USER_SERVICE],
})
export class UserModule {}
