import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../src/infrastructure/services/user.service';
import { UserRepository } from '../src/infrastructure/repositories/user.repository';
import { UserEntity, UserRole } from '../src/infrastructure/database/entities/user.entity';
import { User } from '../src/domain/entities/user.entity';
import { IUserService, USER_SERVICE } from '../src/domain/services/user.service.interface';
import { IUserRepository } from '../src/domain/repositories/user.repository.interface';

// Mock bcrypt
jest.mock('bcryptjs');
import * as bcrypt from 'bcryptjs';
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock data factories
export const createMockUser = (overrides: Partial<User> = {}): User => {
  return new User(
    overrides.id || 'user-123',
    overrides.email || 'test@example.com',
    overrides.username || 'testuser',
    overrides.password || 'hashedPassword123',
    overrides.firstName || 'John',
    overrides.lastName || 'Doe',
    overrides.isActive ?? true,
    overrides.role || UserRole.USER,
    overrides.createdAt || new Date('2024-01-01T00:00:00Z'),
    overrides.updatedAt || new Date('2024-01-01T00:00:00Z')
  );
};

export const createMockUserEntity = (overrides: Partial<UserEntity> = {}): UserEntity => {
  const entity = new UserEntity();
  entity.id = overrides.id || 'user-123';
  entity.email = overrides.email || 'test@example.com';
  entity.username = overrides.username || 'testuser';
  entity.password = overrides.password || 'hashedPassword123';
  entity.firstName = overrides.firstName || 'John';
  entity.lastName = overrides.lastName || 'Doe';
  entity.isActive = overrides.isActive ?? true;
  entity.role = overrides.role || UserRole.USER;
  entity.createdAt = overrides.createdAt || new Date('2024-01-01T00:00:00Z');
  entity.updatedAt = overrides.updatedAt || new Date('2024-01-01T00:00:00Z');
  return entity;
};

export const createMockAdminUser = (): User => {
  return createMockUser({
    id: 'admin-123',
    email: 'admin@example.com',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
  });
};

export const createMockModeratorUser = (): User => {
  return createMockUser({
    id: 'mod-123',
    email: 'mod@example.com',
    username: 'moderator',
    firstName: 'Mod',
    lastName: 'User',
    role: UserRole.MODERATOR,
  });
};

// Mock repository factory
export const createMockUserRepository = () => ({
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
});

// Mock TypeORM repository factory
export const createMockTypeOrmRepository = () => ({
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
  target: {} as any,
  manager: {} as any,
  metadata: {} as any,
  createQueryBuilder: jest.fn(),
  extend: jest.fn(),
} as any);

// Mock user service factory
export const createMockUserService = () => ({
  createUser: jest.fn(),
  getUserById: jest.fn(),
  getUserByEmail: jest.fn(),
  getUserByUsername: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  validateUserCredentials: jest.fn(),
  activateUser: jest.fn(),
  deactivateUser: jest.fn(),
  changeUserRole: jest.fn(),
  isEmailUnique: jest.fn(),
  isUsernameUnique: jest.fn(),
});

// Test module factory for UserService
export const createUserServiceTestModule = async (): Promise<{
  module: TestingModule;
  service: UserService;
  mockUserRepository: jest.Mocked<IUserRepository>;
}> => {
  const mockUserRepository = createMockUserRepository();

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      UserService,
      {
        provide: UserRepository,
        useValue: mockUserRepository,
      },
    ],
  }).compile();

  const service = module.get<UserService>(UserService);

  // Setup default bcrypt mock
  mockedBcrypt.hash.mockResolvedValue('hashedPassword123' as never);

  return { module, service, mockUserRepository };
};

// Test module factory for UserRepository
export const createUserRepositoryTestModule = async (): Promise<{
  module: TestingModule;
  repository: UserRepository;
  mockTypeOrmRepository: jest.Mocked<Repository<UserEntity>>;
}> => {
  const mockTypeOrmRepository = createMockTypeOrmRepository();

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      UserRepository,
      {
        provide: getRepositoryToken(UserEntity),
        useValue: mockTypeOrmRepository,
      },
    ],
  }).compile();

  const repository = module.get<UserRepository>(UserRepository);

  return { module, repository, mockTypeOrmRepository };
};

// Test module factory for Auth Use Cases
export const createAuthUseCasesTestModule = async (): Promise<{
  module: TestingModule;
  mockUserService: jest.Mocked<IUserService>;
}> => {
  const mockUserService = createMockUserService();

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      {
        provide: USER_SERVICE,
        useValue: mockUserService,
      },
    ],
  }).compile();

  return { module, mockUserService };
};

// Validation helpers
export const validateUserResponse = (user: any, expectedUser: User) => {
  expect(user).toBeDefined();
  expect(user.id).toBe(expectedUser.id);
  expect(user.email).toBe(expectedUser.email);
  expect(user.username).toBe(expectedUser.username);
  expect(user.firstName).toBe(expectedUser.firstName);
  expect(user.lastName).toBe(expectedUser.lastName);
  expect(user.isActive).toBe(expectedUser.isActive);
  expect(user.role).toBe(expectedUser.role);
  expect(user.createdAt).toEqual(expectedUser.createdAt);
  expect(user.updatedAt).toEqual(expectedUser.updatedAt);
  expect(user.password).toBeUndefined();
};

export const validateUserWithoutPassword = (user: any) => {
  expect(user).toBeDefined();
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('email');
  expect(user).toHaveProperty('username');
  expect(user).toHaveProperty('firstName');
  expect(user).toHaveProperty('lastName');
  expect(user).toHaveProperty('isActive');
  expect(user).toHaveProperty('role');
  expect(user).toHaveProperty('createdAt');
  expect(user).toHaveProperty('updatedAt');
  expect(user.password).toBeUndefined();
};

// Test data constants
export const TEST_DATA = {
  VALID_EMAIL: 'test@example.com',
  VALID_USERNAME: 'testuser',
  VALID_PASSWORD: 'password123',
  VALID_FIRST_NAME: 'John',
  VALID_LAST_NAME: 'Doe',
  INVALID_EMAIL: 'invalid-email',
  INVALID_USERNAME: '',
  INVALID_PASSWORD: '123',
  NONEXISTENT_ID: 'nonexistent-id',
  NONEXISTENT_EMAIL: 'nonexistent@example.com',
  NONEXISTENT_USERNAME: 'nonexistent',
} as const;

// Error messages constants
export const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'Usuario no encontrado',
  EMAIL_ALREADY_EXISTS: 'El email ya está registrado',
  USERNAME_ALREADY_EXISTS: 'El username ya está en uso',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  INACTIVE_USER: 'Usuario inactivo',
  ALL_FIELDS_REQUIRED: 'Todos los campos son requeridos',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 6 caracteres',
  EMAIL_AND_PASSWORD_REQUIRED: 'Email/username y contraseña son requeridos',
  INVALID_ROLE: 'Rol inválido',
} as const;

// Setup and teardown helpers
export const setupTestEnvironment = () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset bcrypt mocks
    mockedBcrypt.hash.mockResolvedValue('hashedPassword123' as never);
    mockedBcrypt.compare.mockResolvedValue(true as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
};

// Common test scenarios
export const COMMON_TEST_SCENARIOS = {
  VALID_USER_CREATION: {
    email: TEST_DATA.VALID_EMAIL,
    username: TEST_DATA.VALID_USERNAME,
    password: TEST_DATA.VALID_PASSWORD,
    firstName: TEST_DATA.VALID_FIRST_NAME,
    lastName: TEST_DATA.VALID_LAST_NAME,
  },
  VALID_LOGIN: {
    emailOrUsername: TEST_DATA.VALID_EMAIL,
    password: TEST_DATA.VALID_PASSWORD,
  },
  VALID_PROFILE_REQUEST: {
    userId: 'user-123',
  },
} as const;

// Export everything
export default {
  createMockUser,
  createMockUserEntity,
  createMockAdminUser,
  createMockModeratorUser,
  createMockUserRepository,
  createMockTypeOrmRepository,
  createMockUserService,
  createUserServiceTestModule,
  createUserRepositoryTestModule,
  createAuthUseCasesTestModule,
  validateUserResponse,
  validateUserWithoutPassword,
  TEST_DATA,
  ERROR_MESSAGES,
  setupTestEnvironment,
  COMMON_TEST_SCENARIOS,
};
