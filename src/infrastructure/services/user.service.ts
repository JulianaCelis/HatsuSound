import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IUserService } from '@/domain/services/user.service.interface';
import { User, UserRole } from '@/domain/entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { UserEntity } from '../database/entities/user.entity';

@Injectable()
export class UserService implements IUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(
    email: string,
    username: string,
    password: string,
    firstName: string,
    lastName: string,
    role?: UserRole,
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Usar el método create de la entidad User
    const userData = User.create(email, username, hashedPassword, firstName, lastName);
    
    // Crear un objeto User temporal para pasar al repositorio
    const tempUser = new User(
      '', // ID vacío - la BD lo generará
      userData.email,
      userData.username,
      userData.password,
      userData.firstName,
      userData.lastName,
      userData.isActive,
      role || userData.role, // Usar el rol del request o USER por defecto
      new Date(), // createdAt
      new Date(), // updatedAt
    );
    
    // Guardar en la BD
    const savedEntity = await this.userRepository.save(tempUser);
    
    // Retornar la entidad de dominio
    return savedEntity;
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findByUsername(username);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    // Crear un nuevo objeto con los datos actualizados
    const updateData = { ...userData };
    
    // Si hay password, hashearlo antes de actualizar
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    return await this.userRepository.update(id, updateData);
  }

  async deleteUser(id: string): Promise<boolean> {
    return await this.userRepository.delete(id);
  }

  async validateUserCredentials(emailOrUsername: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmailOrUsername(emailOrUsername);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid ? user : null;
  }

  async activateUser(id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;

    const activatedUser = user.activate();
    return await this.userRepository.save(activatedUser);
  }

  async deactivateUser(id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;

    const deactivatedUser = user.deactivate();
    return await this.userRepository.save(deactivatedUser);
  }

  async changeUserRole(id: string, role: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;

    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new ConflictException('Rol inválido');
    }

    const updatedUser = user.changeRole(role as UserRole);
    return await this.userRepository.save(updatedUser);
  }

  async isEmailUnique(email: string): Promise<boolean> {
    const existingUser = await this.userRepository.findByEmail(email);
    return !existingUser;
  }

  async isUsernameUnique(username: string): Promise<boolean> {
    const existingUser = await this.userRepository.findByUsername(username);
    return !existingUser;
  }
}
