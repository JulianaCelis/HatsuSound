import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserService } from '@/domain/services/user.service.interface';
import { User } from '@/domain/entities/user.entity';

export interface GetProfileRequest {
  userId: string;
}

export interface GetProfileResponse {
  user: Omit<User, 'password'>;
}

@Injectable()
export class GetProfileUseCase {
  constructor(private readonly userService: IUserService) {}

  async execute(request: GetProfileRequest): Promise<GetProfileResponse> {
    const { userId } = request;

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Retornar usuario sin password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as Omit<User, 'password'>,
    };
  }
}
