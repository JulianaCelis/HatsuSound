import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '../src/infrastructure/repositories/user.repository';
import { UserEntity, UserRole } from '../src/infrastructure/database/entities/user.entity';
import { User } from '../src/domain/entities/user.entity';
import { createMockUser, createMockUserEntity } from './user.test.config';

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<UserEntity>>;

  const mockUserEntity = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedPassword123',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    role: UserRole.USER,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };

  const mockUser = new User(
    'user-123',
    'test@example.com',
    'testuser',
    'hashedPassword123',
    'John',
    'Doe',
    true,
    UserRole.USER,
    new Date('2024-01-01T00:00:00Z'),
    new Date('2024-01-01T00:00:00Z')
  );

  beforeEach(async () => {
    const mockTypeOrmRepositoryImpl = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockTypeOrmRepositoryImpl,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    mockTypeOrmRepository = module.get(getRepositoryToken(UserEntity));

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save a new user successfully', async () => {
      const newUser = createMockUser({
        id: '',
        email: 'newuser@example.com',
        username: 'newuser',
        firstName: 'New',
        lastName: 'User',
      });

      const savedEntity = createMockUserEntity({
        id: 'new-user-456',
        email: 'newuser@example.com',
        username: 'newuser',
        firstName: 'New',
        lastName: 'User',
      });
      mockTypeOrmRepository.save.mockResolvedValue(savedEntity);

      const result = await repository.save(newUser);

      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'newuser@example.com',
          username: 'newuser',
          firstName: 'New',
          lastName: 'User',
          isActive: true,
          role: UserRole.USER,
        })
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: 'new-user-456',
          email: 'newuser@example.com',
          username: 'newuser',
          firstName: 'New',
          lastName: 'User',
          isActive: true,
          role: UserRole.USER,
        })
      );
    });

    it('should update an existing user successfully', async () => {
      const existingUser = createMockUser({
        id: 'user-123',
        firstName: 'Updated',
      });

      const updatedEntity = createMockUserEntity({
        id: 'user-123',
        firstName: 'Updated',
      });
      mockTypeOrmRepository.save.mockResolvedValue(updatedEntity);

      const result = await repository.save(existingUser);

      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-123',
          firstName: 'Updated',
        })
      );
      expect(result.firstName).toBe('Updated');
    });

    it('should handle save errors', async () => {
      const saveError = new Error('Database save failed');
      mockTypeOrmRepository.save.mockRejectedValue(saveError);

      await expect(repository.save(mockUser)).rejects.toThrow(saveError);
    });
  });

  describe('findById', () => {
    it('should find user by ID successfully', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(mockUserEntity);

      const result = await repository.findById('user-123');

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(result).toEqual(
        expect.objectContaining({
          id: 'user-123',
          email: 'test@example.com',
          username: 'testuser',
        })
      );
    });

    it('should return null when user not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent' },
      });
      expect(result).toBeNull();
    });

    it('should handle findOne errors', async () => {
      const findError = new Error('Database find failed');
      mockTypeOrmRepository.findOne.mockRejectedValue(findError);

      await expect(repository.findById('user-123')).rejects.toThrow(findError);
    });
  });

  describe('findAll', () => {
    it('should return all users successfully', async () => {
      const userEntities = [
        mockUserEntity,
        { ...mockUserEntity, id: 'user-456', email: 'user2@example.com' },
      ];
      mockTypeOrmRepository.find.mockResolvedValue(userEntities);

      const result = await repository.findAll();

      expect(mockTypeOrmRepository.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 'user-123',
          email: 'test@example.com',
        })
      );
      expect(result[1]).toEqual(
        expect.objectContaining({
          id: 'user-456',
          email: 'user2@example.com',
        })
      );
    });

    it('should return empty array when no users exist', async () => {
      mockTypeOrmRepository.find.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(mockTypeOrmRepository.find).toHaveBeenCalled();
      expect(result).toHaveLength(0);
    });
  });

  describe('update', () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('should update user successfully', async () => {
      const existingEntity = { ...mockUserEntity };
      const updatedEntity = { ...mockUserEntity, ...updateData };
      
      mockTypeOrmRepository.findOne.mockResolvedValue(existingEntity);
      mockTypeOrmRepository.save.mockResolvedValue(updatedEntity);

      const result = await repository.update('user-123', updateData);

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Updated',
          lastName: 'Name',
        })
      );
      expect(result).toEqual(
        expect.objectContaining({
          firstName: 'Updated',
          lastName: 'Name',
        })
      );
    });

    it('should return null when user not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.update('nonexistent', updateData);

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent' },
      });
      expect(mockTypeOrmRepository.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should only update provided fields', async () => {
      const existingEntity = { ...mockUserEntity };
      const partialUpdateData = { firstName: 'Updated' };
      const updatedEntity = { ...mockUserEntity, firstName: 'Updated' };
      
      mockTypeOrmRepository.findOne.mockResolvedValue(existingEntity);
      mockTypeOrmRepository.save.mockResolvedValue(updatedEntity);

      await repository.update('user-123', partialUpdateData);

      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Updated',
          lastName: 'Doe', // Should remain unchanged
        })
      );
    });

    it('should handle undefined fields correctly', async () => {
      const existingEntity = { ...mockUserEntity };
      const updateDataWithUndefined = {
        firstName: 'Updated',
        lastName: undefined,
      };
      
      mockTypeOrmRepository.findOne.mockResolvedValue(existingEntity);
      mockTypeOrmRepository.save.mockResolvedValue(existingEntity);

      await repository.update('user-123', updateDataWithUndefined);

      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Updated',
          lastName: 'Doe', // Should remain unchanged
        })
      );
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      const deleteResult = { affected: 1, raw: [] };
      mockTypeOrmRepository.delete.mockResolvedValue(deleteResult);

      const result = await repository.delete('user-123');

      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith('user-123');
      expect(result).toBe(true);
    });

    it('should return false when user not found', async () => {
      const deleteResult = { affected: 0, raw: [] };
      mockTypeOrmRepository.delete.mockResolvedValue(deleteResult);

      const result = await repository.delete('nonexistent');

      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email successfully', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(mockUserEntity);

      const result = await repository.findByEmail('test@example.com');

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(
        expect.objectContaining({
          email: 'test@example.com',
        })
      );
    });

    it('should return null when email not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should find user by username successfully', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(mockUserEntity);

      const result = await repository.findByUsername('testuser');

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(result).toEqual(
        expect.objectContaining({
          username: 'testuser',
        })
      );
    });

    it('should return null when username not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByUsername('nonexistent');

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'nonexistent' },
      });
      expect(result).toBeNull();
    });
  });

  describe('findByEmailOrUsername', () => {
    it('should find user by email successfully', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(mockUserEntity);

      const result = await repository.findByEmailOrUsername('test@example.com');

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: [
          { email: 'test@example.com' },
          { username: 'test@example.com' },
        ],
      });
      expect(result).toEqual(
        expect.objectContaining({
          email: 'test@example.com',
        })
      );
    });

    it('should find user by username successfully', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(mockUserEntity);

      const result = await repository.findByEmailOrUsername('testuser');

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: [
          { email: 'testuser' },
          { username: 'testuser' },
        ],
      });
      expect(result).toEqual(
        expect.objectContaining({
          username: 'testuser',
        })
      );
    });

    it('should return null when neither email nor username found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByEmailOrUsername('nonexistent');

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: [
          { email: 'nonexistent' },
          { username: 'nonexistent' },
        ],
      });
      expect(result).toBeNull();
    });
  });

  describe('findActiveUsers', () => {
    it('should return only active users', async () => {
      const activeUserEntities = [
        mockUserEntity,
        { ...mockUserEntity, id: 'user-456', email: 'user2@example.com' },
      ];
      mockTypeOrmRepository.find.mockResolvedValue(activeUserEntities);

      const result = await repository.findActiveUsers();

      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
      });
      expect(result).toHaveLength(2);
      expect(result.every(user => user.isActive)).toBe(true);
    });

    it('should return empty array when no active users exist', async () => {
      mockTypeOrmRepository.find.mockResolvedValue([]);

      const result = await repository.findActiveUsers();

      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
      });
      expect(result).toHaveLength(0);
    });
  });

  describe('findUsersByRole', () => {
    it('should return users with specific role', async () => {
      const adminUserEntities = [
        { ...mockUserEntity, id: 'admin-123', role: UserRole.ADMIN },
        { ...mockUserEntity, id: 'admin-456', role: UserRole.ADMIN },
      ];
      mockTypeOrmRepository.find.mockResolvedValue(adminUserEntities);

      const result = await repository.findUsersByRole(UserRole.ADMIN);

      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: { role: UserRole.ADMIN },
      });
      expect(result).toHaveLength(2);
      expect(result.every(user => user.role === UserRole.ADMIN)).toBe(true);
    });

    it('should return empty array when no users with role exist', async () => {
      mockTypeOrmRepository.find.mockResolvedValue([]);

      const result = await repository.findUsersByRole(UserRole.MODERATOR);

      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: { role: UserRole.MODERATOR },
      });
      expect(result).toHaveLength(0);
    });
  });

  // Note: Mapping methods are private and tested indirectly through public methods
  // The mapping functionality is verified by testing the public save, findById, etc. methods

  describe('Error handling', () => {
    it('should propagate TypeORM errors', async () => {
      const typeOrmError = new Error('TypeORM operation failed');
      mockTypeOrmRepository.findOne.mockRejectedValue(typeOrmError);

      await expect(repository.findById('user-123')).rejects.toThrow(typeOrmError);
    });

    it('should handle save errors gracefully', async () => {
      const saveError = new Error('Save operation failed');
      mockTypeOrmRepository.save.mockRejectedValue(saveError);

      await expect(repository.save(mockUser)).rejects.toThrow(saveError);
    });

    it('should handle find errors gracefully', async () => {
      const findError = new Error('Find operation failed');
      mockTypeOrmRepository.find.mockRejectedValue(findError);

      await expect(repository.findAll()).rejects.toThrow(findError);
    });
  });
});
