import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '@/domain/repositories/user.repository.interface';
import { User, UserRole } from '@/domain/entities/user.entity';
import { UserEntity } from '../database/entities/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async save(user: User): Promise<User> {
    const userEntity = this.mapToEntity(user);
    const savedEntity = await this.userRepository.save(userEntity);
    return this.mapToDomain(savedEntity);
  }

  async findById(id: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({ where: { id } });
    return userEntity ? this.mapToDomain(userEntity) : null;
  }

  async findAll(): Promise<User[]> {
    const userEntities = await this.userRepository.find();
    return userEntities.map(entity => this.mapToDomain(entity));
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({ where: { id } });
    if (!userEntity) return null;

    // Solo actualizar las propiedades que existen en la entidad
    if (userData.email !== undefined) userEntity.email = userData.email;
    if (userData.username !== undefined) userEntity.username = userData.username;
    if (userData.password !== undefined) userEntity.password = userData.password;
    if (userData.firstName !== undefined) userEntity.firstName = userData.firstName;
    if (userData.lastName !== undefined) userEntity.lastName = userData.lastName;
    if (userData.isActive !== undefined) userEntity.isActive = userData.isActive;
    if (userData.role !== undefined) userEntity.role = userData.role;

    const updatedEntity = await this.userRepository.save(userEntity);
    return this.mapToDomain(updatedEntity);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected > 0;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({ where: { email } });
    return userEntity ? this.mapToDomain(userEntity) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({ where: { username } });
    return userEntity ? this.mapToDomain(userEntity) : null;
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({
      where: [
        { email: emailOrUsername },
        { username: emailOrUsername },
      ],
    });
    return userEntity ? this.mapToDomain(userEntity) : null;
  }

  async findActiveUsers(): Promise<User[]> {
    const userEntities = await this.userRepository.find({
      where: { isActive: true },
    });
    return userEntities.map(entity => this.mapToDomain(entity));
  }

  async findUsersByRole(role: string): Promise<User[]> {
    const userEntities = await this.userRepository.find({
      where: { role: role as UserRole },
    });
    return userEntities.map(entity => this.mapToDomain(entity));
  }

  private mapToEntity(user: User): UserEntity {
    const entity = new UserEntity();
    
    // Solo asignar ID si existe (para actualizaciones)
    if (user.id) {
      entity.id = user.id;
    }
    
    entity.email = user.email;
    entity.username = user.username;
    entity.password = user.password;
    entity.firstName = user.firstName;
    entity.lastName = user.lastName;
    entity.isActive = user.isActive;
    entity.role = user.role;
    
    // Solo asignar fechas si existen (para actualizaciones)
    if (user.createdAt) {
      entity.createdAt = user.createdAt;
    }
    if (user.updatedAt) {
      entity.updatedAt = user.updatedAt;
    }
    
    return entity;
  }

  private mapToDomain(entity: UserEntity): User {
    return new User(
      entity.id,
      entity.email,
      entity.username,
      entity.password,
      entity.firstName,
      entity.lastName,
      entity.isActive,
      entity.role,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
