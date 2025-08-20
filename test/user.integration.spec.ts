import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserModule } from '../src/infrastructure/modules/user.module';
import { UserService } from '../src/infrastructure/services/user.service';
import { UserRepository } from '../src/infrastructure/repositories/user.repository';
import { UserEntity, UserRole } from '../src/infrastructure/database/entities/user.entity';
import { User } from '../src/domain/entities/user.entity';
// Note: Auth use cases are tested separately
import { createMockUser, createMockUserEntity, createMockAdminUser } from './user.test.config';

// Mock bcrypt for integration tests
jest.mock('bcryptjs');
import * as bcrypt from 'bcryptjs';
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('User Module Integration Tests', () => {
  let module: TestingModule;
  let userService: UserService;
  let userRepository: UserRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<UserEntity>>;
  // Note: Auth use cases are tested separately in auth.use-cases.spec.ts

  const mockUser = createMockUser();
  const mockAdminUser = createMockAdminUser();

  beforeEach(async () => {
    const mockTypeOrmRepositoryImpl = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };

    module = await Test.createTestingModule({
      imports: [UserModule],
    })
      .overrideProvider(getRepositoryToken(UserEntity))
      .useValue(mockTypeOrmRepositoryImpl)
      .compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
    mockTypeOrmRepository = module.get(getRepositoryToken(UserEntity));
    // Auth use cases are tested separately

    // Reset mocks
    jest.clearAllMocks();
    
    // Setup bcrypt mock
    mockedBcrypt.hash.mockResolvedValue('hashedPassword123' as never);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('UserService + UserRepository Integration', () => {
    it('should create and retrieve user through service and repository', async () => {
      // Mock the repository save method
      const savedEntity = createMockUserEntity({
        email: 'newuser@example.com',
        username: 'newuser',
        firstName: 'New',
        lastName: 'User',
      });
      mockTypeOrmRepository.save.mockResolvedValue(savedEntity);

      // Create user through service
      const newUser = await userService.createUser(
        'newuser@example.com',
        'newuser',
        'password123',
        'New',
        'User'
      );

      // Verify user was created
      expect(newUser).toBeDefined();
      expect(newUser.email).toBe('newuser@example.com');
      expect(newUser.username).toBe('newuser');

      // Mock findById to return the created user
      mockTypeOrmRepository.findOne.mockResolvedValue(savedEntity);

      // Retrieve user through service
      const retrievedUser = await userService.getUserById(newUser.id);

      // Verify user was retrieved correctly
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser?.email).toBe('newuser@example.com');
      expect(retrievedUser?.username).toBe('newuser');
    });

    it('should update user through service and repository', async () => {
      // Mock findById to return existing user
      const existingEntity = createMockUserEntity();
      mockTypeOrmRepository.findOne.mockResolvedValue(existingEntity);

      // Mock save to return updated user
      const updatedEntity = { ...existingEntity, firstName: 'Updated' };
      mockTypeOrmRepository.save.mockResolvedValue(updatedEntity);

      // Update user through service
      const updatedUser = await userService.updateUser('user-123', {
        firstName: 'Updated',
      });

      // Verify user was updated
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.firstName).toBe('Updated');
      expect(updatedUser?.lastName).toBe('Doe'); // Should remain unchanged
    });

    it('should handle user activation through service and repository', async () => {
      // Mock findById to return inactive user
      const inactiveEntity = createMockUserEntity({ isActive: false });
      mockTypeOrmRepository.findOne.mockResolvedValue(inactiveEntity);

      // Mock save to return activated user
      const activatedEntity = { ...inactiveEntity, isActive: true };
      mockTypeOrmRepository.save.mockResolvedValue(activatedEntity);

      // Activate user through service
      const activatedUser = await userService.activateUser('user-123');

      // Verify user was activated
      expect(activatedUser).toBeDefined();
      expect(activatedUser?.isActive).toBe(true);
    });
  });

  // Note: Auth use cases integration is tested separately in auth.use-cases.spec.ts

  describe('Complete User Lifecycle Integration', () => {
    it('should handle complete user lifecycle: create, update, activate, deactivate', async () => {
      // Step 1: Create user
      const savedEntity = createMockUserEntity({
        email: 'lifecycle@example.com',
        username: 'lifecycleuser',
        firstName: 'Lifecycle',
        lastName: 'User',
      });
      mockTypeOrmRepository.save.mockResolvedValue(savedEntity);

      const newUser = await userService.createUser(
        'lifecycle@example.com',
        'lifecycleuser',
        'password123',
        'Lifecycle',
        'User'
      );

      expect(newUser).toBeDefined();
      expect(newUser.email).toBe('lifecycle@example.com');

      // Step 2: Update user
      const existingEntity = createMockUserEntity({ id: newUser.id });
      mockTypeOrmRepository.findOne.mockResolvedValue(existingEntity);
      
      const updatedEntity = { ...existingEntity, firstName: 'Updated' };
      mockTypeOrmRepository.save.mockResolvedValue(updatedEntity);

      const updatedUser = await userService.updateUser(newUser.id, {
        firstName: 'Updated',
      });

      expect(updatedUser?.firstName).toBe('Updated');

      // Step 3: Deactivate user
      const deactivatedEntity = { ...updatedEntity, isActive: false };
      mockTypeOrmRepository.save.mockResolvedValue(deactivatedEntity);

      const deactivatedUser = await userService.deactivateUser(newUser.id);

      expect(deactivatedUser?.isActive).toBe(false);

      // Step 4: Activate user
      const reactivatedEntity = { ...deactivatedEntity, isActive: true };
      mockTypeOrmRepository.save.mockResolvedValue(reactivatedEntity);

      const reactivatedUser = await userService.activateUser(newUser.id);

      expect(reactivatedUser?.isActive).toBe(true);
    });

    it('should handle user role management through lifecycle', async () => {
      // Create user with default role
      const savedEntity = createMockUserEntity();
      mockTypeOrmRepository.save.mockResolvedValue(savedEntity);

      const newUser = await userService.createUser(
        'roleuser@example.com',
        'roleuser',
        'password123',
        'Role',
        'User'
      );

      expect(newUser.role).toBe(UserRole.USER);

      // Change role to moderator
      const existingEntity = createMockUserEntity({ id: newUser.id });
      mockTypeOrmRepository.findOne.mockResolvedValue(existingEntity);
      
      const moderatorEntity = { ...existingEntity, role: UserRole.MODERATOR };
      mockTypeOrmRepository.save.mockResolvedValue(moderatorEntity);

      const moderatorUser = await userService.changeUserRole(newUser.id, UserRole.MODERATOR);

      expect(moderatorUser?.role).toBe(UserRole.MODERATOR);

      // Change role to admin
      const adminEntity = { ...existingEntity, role: UserRole.ADMIN };
      mockTypeOrmRepository.save.mockResolvedValue(adminEntity);

      const adminUser = await userService.changeUserRole(newUser.id, UserRole.ADMIN);

      expect(adminUser?.role).toBe(UserRole.ADMIN);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle database errors gracefully across layers', async () => {
      // Mock database error
      const dbError = new Error('Database connection failed');
      mockTypeOrmRepository.save.mockRejectedValue(dbError);

      // Attempt to create user should propagate error
      await expect(
        userService.createUser(
          'error@example.com',
          'erroruser',
          'password123',
          'Error',
          'User'
        )
      ).rejects.toThrow('Database connection failed');
    });

    // Note: Auth use case error handling is tested separately in auth.use-cases.spec.ts
  });

  describe('Data Consistency Integration', () => {
    it('should maintain data consistency between domain and infrastructure layers', async () => {
      // Create user through service
      const savedEntity = createMockUserEntity({
        email: 'consistency@example.com',
        username: 'consistencyuser',
        firstName: 'Consistency',
        lastName: 'User',
      });
      mockTypeOrmRepository.save.mockResolvedValue(savedEntity);

      const newUser = await userService.createUser(
        'consistency@example.com',
        'consistencyuser',
        'password123',
        'Consistency',
        'User'
      );

      // Verify domain entity properties
      expect(newUser).toBeInstanceOf(User);
      expect(newUser.id).toBeDefined();
      expect(newUser.email).toBe('consistency@example.com');
      expect(newUser.username).toBe('consistencyuser');
      expect(newUser.firstName).toBe('Consistency');
      expect(newUser.lastName).toBe('User');
      expect(newUser.isActive).toBe(true);
      expect(newUser.role).toBe(UserRole.USER);
      expect(newUser.createdAt).toBeInstanceOf(Date);
      expect(newUser.updatedAt).toBeInstanceOf(Date);

      // Verify password was hashed (through service)
      expect(newUser.password).not.toBe('password123');
      expect(newUser.password).toBe('hashedPassword123'); // Mocked bcrypt hash
    });

    it('should handle entity mapping correctly between layers', async () => {
      // Mock repository to return entity
      const mockEntity = createMockUserEntity();
      mockTypeOrmRepository.findOne.mockResolvedValue(mockEntity);

      // Retrieve user through service
      const retrievedUser = await userService.getUserById('user-123');

      // Verify mapping from entity to domain object
      expect(retrievedUser).toBeInstanceOf(User);
      expect(retrievedUser?.id).toBe(mockEntity.id);
      expect(retrievedUser?.email).toBe(mockEntity.email);
      expect(retrievedUser?.username).toBe(mockEntity.username);
      expect(retrievedUser?.firstName).toBe(mockEntity.firstName);
      expect(retrievedUser?.lastName).toBe(mockEntity.lastName);
      expect(retrievedUser?.isActive).toBe(mockEntity.isActive);
      expect(retrievedUser?.role).toBe(mockEntity.role);
      expect(retrievedUser?.createdAt).toEqual(mockEntity.createdAt);
      expect(retrievedUser?.updatedAt).toEqual(mockEntity.updatedAt);
    });
  });

  describe('Performance and Scalability Integration', () => {
    it('should handle multiple concurrent user operations', async () => {
      const concurrentOperations = Array.from({ length: 10 }, (_, index) => ({
        email: `concurrent${index}@example.com`,
        username: `concurrent${index}`,
        password: 'password123',
        firstName: `User${index}`,
        lastName: 'Concurrent',
      }));

      // Mock repository to handle concurrent saves
      const savedEntities = concurrentOperations.map((op, index) =>
        createMockUserEntity({
          id: `user-${index}`,
          email: op.email,
          username: op.username,
          firstName: op.firstName,
        })
      );

      // Mock save to return the appropriate entity for each call
      mockTypeOrmRepository.save.mockImplementation((entity) => {
        const index = concurrentOperations.findIndex(op => 
          op.email === entity.email || op.username === entity.username
        );
        return Promise.resolve(savedEntities[index] || savedEntities[0]);
      });

      // Execute concurrent operations
      const results = await Promise.all(
        concurrentOperations.map(op =>
          userService.createUser(
            op.email,
            op.username,
            op.password,
            op.firstName,
            op.lastName
          )
        )
      );

      // Verify all operations completed
      expect(results).toHaveLength(10);
      results.forEach((result, index) => {
        expect(result.email).toBe(concurrentOperations[index].email);
        expect(result.username).toBe(concurrentOperations[index].username);
      });
    });

    it('should handle large user datasets efficiently', async () => {
      // Mock repository to return large dataset
      const largeUserEntities = Array.from({ length: 1000 }, (_, index) =>
        createMockUserEntity({
          id: `user-${index}`,
          email: `user${index}@example.com`,
          username: `user${index}`,
        })
      );

      mockTypeOrmRepository.find.mockResolvedValue(largeUserEntities);

      // Retrieve all users
      const allUsers = await userRepository.findAll();

      // Verify all users were retrieved
      expect(allUsers).toHaveLength(1000);
      expect(allUsers[0]).toBeInstanceOf(User);
      expect(allUsers[999]).toBeInstanceOf(User);
    });
  });
});
