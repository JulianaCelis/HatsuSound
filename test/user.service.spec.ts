import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../src/infrastructure/services/user.service';
import { UserRepository } from '../src/infrastructure/repositories/user.repository';
import { User, UserRole } from '../src/domain/entities/user.entity';
import { createMockUser, createMockAdminUser } from './user.test.config';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUser = createMockUser();
  const mockAdminUser = createMockAdminUser();

  beforeEach(async () => {
    const mockUserRepositoryImpl = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findByEmailOrUsername: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      findActiveUsers: jest.fn(),
      findUsersByRole: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepositoryImpl,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    mockUserRepository = module.get(UserRepository);

    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default bcrypt mock
    mockedBcrypt.hash.mockResolvedValue('hashedPassword123' as never);
  });

  describe('createUser', () => {
    const createUserData = {
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
    };

    it('should create a user successfully with default role', async () => {
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.createUser(
        createUserData.email,
        createUserData.username,
        createUserData.password,
        createUserData.firstName,
        createUserData.lastName
      );

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(createUserData.password, 10);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: createUserData.email,
          username: createUserData.username,
          firstName: createUserData.firstName,
          lastName: createUserData.lastName,
          isActive: true,
          role: UserRole.USER,
        })
      );
      expect(result).toBe(mockUser);
    });

    it('should create a user with custom role', async () => {
      mockUserRepository.save.mockResolvedValue(mockAdminUser);

      const result = await service.createUser(
        createUserData.email,
        createUserData.username,
        createUserData.password,
        createUserData.firstName,
        createUserData.lastName,
        UserRole.ADMIN
      );

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          role: UserRole.ADMIN,
        })
      );
      expect(result).toBe(mockAdminUser);
    });

    it('should hash password before saving', async () => {
      const hashedPassword = 'superHashedPassword456';
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockUserRepository.save.mockResolvedValue(mockUser);

      await service.createUser(
        createUserData.email,
        createUserData.username,
        createUserData.password,
        createUserData.firstName,
        createUserData.lastName
      );

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(createUserData.password, 10);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          password: hashedPassword,
        })
      );
    });

    it('should handle bcrypt hash errors', async () => {
      const hashError = new Error('Hash failed');
      mockedBcrypt.hash.mockRejectedValue(hashError as never);

      await expect(
        service.createUser(
          createUserData.email,
          createUserData.username,
          createUserData.password,
          createUserData.firstName,
          createUserData.lastName
        )
      ).rejects.toThrow(hashError);

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.getUserById('user-123');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
      expect(result).toBe(mockUser);
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await service.getUserById('nonexistent');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user when found by email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.getUserByEmail('test@example.com');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toBe(mockUser);
    });

    it('should return null when email not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await service.getUserByEmail('nonexistent@example.com');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('getUserByUsername', () => {
    it('should return user when found by username', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(mockUser);

      const result = await service.getUserByUsername('testuser');

      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('testuser');
      expect(result).toBe(mockUser);
    });

    it('should return null when username not found', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(null);

      const result = await service.getUserByUsername('nonexistent');

      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('should update user successfully without password', async () => {
      const updatedUser = createMockUser({ ...updateData });
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await service.updateUser('user-123', updateData);

      expect(mockUserRepository.update).toHaveBeenCalledWith('user-123', updateData);
      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
      expect(result).toBe(updatedUser);
    });

    it('should hash password when updating with new password', async () => {
      const passwordUpdateData = { ...updateData, password: 'newPassword123' };
      const hashedPassword = 'newHashedPassword456';
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      
      const updatedUser = createMockUser({ ...updateData, password: hashedPassword });
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await service.updateUser('user-123', passwordUpdateData);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(mockUserRepository.update).toHaveBeenCalledWith('user-123', {
        ...updateData,
        password: hashedPassword,
      });
      expect(result).toBe(updatedUser);
    });

    it('should return null when user not found', async () => {
      mockUserRepository.update.mockResolvedValue(null);

      const result = await service.updateUser('nonexistent', updateData);

      expect(mockUserRepository.update).toHaveBeenCalledWith('nonexistent', updateData);
      expect(result).toBeNull();
    });

    it('should handle bcrypt hash errors during password update', async () => {
      const passwordUpdateData = { ...updateData, password: 'newPassword123' };
      const hashError = new Error('Hash failed');
      mockedBcrypt.hash.mockRejectedValue(hashError as never);

      await expect(
        service.updateUser('user-123', passwordUpdateData)
      ).rejects.toThrow(hashError);

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockUserRepository.delete.mockResolvedValue(true);

      const result = await service.deleteUser('user-123');

      expect(mockUserRepository.delete).toHaveBeenCalledWith('user-123');
      expect(result).toBe(true);
    });

    it('should return false when user not found', async () => {
      mockUserRepository.delete.mockResolvedValue(false);

      const result = await service.deleteUser('nonexistent');

      expect(mockUserRepository.delete).toHaveBeenCalledWith('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('validateUserCredentials', () => {
    it('should return user when credentials are valid', async () => {
      mockUserRepository.findByEmailOrUsername.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUserCredentials('test@example.com', 'password123');

      expect(mockUserRepository.findByEmailOrUsername).toHaveBeenCalledWith('test@example.com');
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
      expect(result).toBe(mockUser);
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findByEmailOrUsername.mockResolvedValue(null);

      const result = await service.validateUserCredentials('nonexistent@example.com', 'password123');

      expect(mockUserRepository.findByEmailOrUsername).toHaveBeenCalledWith('nonexistent@example.com');
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      mockUserRepository.findByEmailOrUsername.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validateUserCredentials('test@example.com', 'wrongpassword');

      expect(mockedBcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockUser.password);
      expect(result).toBeNull();
    });

    it('should work with username instead of email', async () => {
      mockUserRepository.findByEmailOrUsername.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUserCredentials('testuser', 'password123');

      expect(mockUserRepository.findByEmailOrUsername).toHaveBeenCalledWith('testuser');
      expect(result).toBe(mockUser);
    });
  });

  describe('activateUser', () => {
    it('should activate inactive user successfully', async () => {
      const inactiveUser = createMockUser({ isActive: false });
      const activatedUser = createMockUser({ isActive: true });
      
      mockUserRepository.findById.mockResolvedValue(inactiveUser);
      mockUserRepository.save.mockResolvedValue(activatedUser);

      const result = await service.activateUser('user-123');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
        })
      );
      expect(result).toBe(activatedUser);
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await service.activateUser('nonexistent');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('nonexistent');
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate active user successfully', async () => {
      const activeUser = createMockUser({ isActive: true });
      const deactivatedUser = createMockUser({ isActive: false });
      
      mockUserRepository.findById.mockResolvedValue(activeUser);
      mockUserRepository.save.mockResolvedValue(deactivatedUser);

      const result = await service.deactivateUser('user-123');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
        })
      );
      expect(result).toBe(deactivatedUser);
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await service.deactivateUser('nonexistent');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('nonexistent');
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('changeUserRole', () => {
    it('should change user role successfully', async () => {
      const updatedUser = createMockUser({ role: UserRole.ADMIN });
      
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.changeUserRole('user-123', UserRole.ADMIN);

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          role: UserRole.ADMIN,
        })
      );
      expect(result).toBe(updatedUser);
    });

    it('should throw ConflictException for invalid role', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(
        service.changeUserRole('user-123', 'INVALID_ROLE' as UserRole)
      ).rejects.toThrow(ConflictException);

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await service.changeUserRole('nonexistent', UserRole.ADMIN);

      expect(mockUserRepository.findById).toHaveBeenCalledWith('nonexistent');
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should accept all valid UserRole values', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      // Test all valid roles
      await expect(service.changeUserRole('user-123', UserRole.USER)).resolves.toBe(mockUser);
      await expect(service.changeUserRole('user-123', UserRole.MODERATOR)).resolves.toBe(mockUser);
      await expect(service.changeUserRole('user-123', UserRole.ADMIN)).resolves.toBe(mockUser);
    });
  });

  describe('isEmailUnique', () => {
    it('should return true when email is unique', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await service.isEmailUnique('unique@example.com');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('unique@example.com');
      expect(result).toBe(true);
    });

    it('should return false when email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.isEmailUnique('test@example.com');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toBe(false);
    });
  });

  describe('isUsernameUnique', () => {
    it('should return true when username is unique', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(null);

      const result = await service.isUsernameUnique('uniqueusername');

      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('uniqueusername');
      expect(result).toBe(true);
    });

    it('should return false when username already exists', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(mockUser);

      const result = await service.isUsernameUnique('testuser');

      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('testuser');
      expect(result).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should propagate repository errors', async () => {
      const repositoryError = new Error('Database connection failed');
      mockUserRepository.findById.mockRejectedValue(repositoryError);

      await expect(service.getUserById('user-123')).rejects.toThrow(repositoryError);
    });

    it('should handle bcrypt errors gracefully', async () => {
      const bcryptError = new Error('Bcrypt operation failed');
      mockedBcrypt.hash.mockRejectedValue(bcryptError as never);

      await expect(
        service.createUser(
          'test@example.com',
          'testuser',
          'password123',
          'John',
          'Doe'
        )
      ).rejects.toThrow(bcryptError);
    });
  });
});
