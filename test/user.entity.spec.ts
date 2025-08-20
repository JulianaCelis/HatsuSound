import { User, UserRole } from '../src/domain/entities/user.entity';

describe('User Entity', () => {
  const mockDate = new Date('2024-01-01T00:00:00Z');
  const mockId = 'user-123';

  describe('Constructor', () => {
    it('should create a user with all required properties', () => {
      const user = new User(
        mockId,
        'test@example.com',
        'testuser',
        'hashedPassword123',
        'John',
        'Doe',
        true,
        UserRole.USER,
        mockDate,
        mockDate
      );

      expect(user.id).toBe(mockId);
      expect(user.email).toBe('test@example.com');
      expect(user.username).toBe('testuser');
      expect(user.password).toBe('hashedPassword123');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.isActive).toBe(true);
      expect(user.role).toBe(UserRole.USER);
      expect(user.createdAt).toBe(mockDate);
      expect(user.updatedAt).toBe(mockDate);
    });

    it('should create a user with different roles', () => {
      const adminUser = new User(
        mockId,
        'admin@example.com',
        'admin',
        'hashedPassword123',
        'Admin',
        'User',
        true,
        UserRole.ADMIN,
        mockDate,
        mockDate
      );

      const moderatorUser = new User(
        mockId,
        'mod@example.com',
        'moderator',
        'hashedPassword123',
        'Mod',
        'User',
        true,
        UserRole.MODERATOR,
        mockDate,
        mockDate
      );

      expect(adminUser.role).toBe(UserRole.ADMIN);
      expect(moderatorUser.role).toBe(UserRole.MODERATOR);
    });
  });

  describe('Static create method', () => {
    it('should create user data with default values', () => {
      const userData = User.create(
        'test@example.com',
        'testuser',
        'password123',
        'John',
        'Doe'
      );

      expect(userData.email).toBe('test@example.com');
      expect(userData.username).toBe('testuser');
      expect(userData.password).toBe('password123');
      expect(userData.firstName).toBe('John');
      expect(userData.lastName).toBe('Doe');
      expect(userData.isActive).toBe(true);
      expect(userData.role).toBe(UserRole.USER);
    });

    it('should always set isActive to true and role to USER', () => {
      const userData = User.create(
        'test@example.com',
        'testuser',
        'password123',
        'John',
        'Doe'
      );

      expect(userData.isActive).toBe(true);
      expect(userData.role).toBe(UserRole.USER);
    });
  });

  describe('fullName getter', () => {
    it('should return full name concatenated', () => {
      const user = new User(
        mockId,
        'test@example.com',
        'testuser',
        'hashedPassword123',
        'John',
        'Doe',
        true,
        UserRole.USER,
        mockDate,
        mockDate
      );

      expect(user.fullName).toBe('John Doe');
    });

    it('should handle empty names', () => {
      const user = new User(
        mockId,
        'test@example.com',
        'testuser',
        'hashedPassword123',
        '',
        '',
        true,
        UserRole.USER,
        mockDate,
        mockDate
      );

      expect(user.fullName).toBe(' ');
    });
  });

  describe('activate method', () => {
    it('should activate an inactive user', () => {
      const inactiveUser = new User(
        mockId,
        'test@example.com',
        'testuser',
        'hashedPassword123',
        'John',
        'Doe',
        false,
        UserRole.USER,
        mockDate,
        mockDate
      );

      const activatedUser = inactiveUser.activate();

      expect(activatedUser.isActive).toBe(true);
      expect(activatedUser.id).toBe(mockId);
      expect(activatedUser.email).toBe('test@example.com');
      expect(activatedUser.username).toBe('testuser');
      expect(activatedUser.password).toBe('hashedPassword123');
      expect(activatedUser.firstName).toBe('John');
      expect(activatedUser.lastName).toBe('Doe');
      expect(activatedUser.role).toBe(UserRole.USER);
      expect(activatedUser.createdAt).toBe(mockDate);
      expect(activatedUser.updatedAt.getTime()).toBeGreaterThan(mockDate.getTime());
    });

    it('should return a new User instance', () => {
      const inactiveUser = new User(
        mockId,
        'test@example.com',
        'testuser',
        'hashedPassword123',
        'John',
        'Doe',
        false,
        UserRole.USER,
        mockDate,
        mockDate
      );

      const activatedUser = inactiveUser.activate();

      expect(activatedUser).not.toBe(inactiveUser);
      expect(activatedUser).toBeInstanceOf(User);
    });
  });

  describe('deactivate method', () => {
    it('should deactivate an active user', () => {
      const activeUser = new User(
        mockId,
        'test@example.com',
        'testuser',
        'hashedPassword123',
        'John',
        'Doe',
        true,
        UserRole.USER,
        mockDate,
        mockDate
      );

      const deactivatedUser = activeUser.deactivate();

      expect(deactivatedUser.isActive).toBe(false);
      expect(deactivatedUser.id).toBe(mockId);
      expect(deactivatedUser.email).toBe('test@example.com');
      expect(deactivatedUser.username).toBe('testuser');
      expect(deactivatedUser.password).toBe('hashedPassword123');
      expect(deactivatedUser.firstName).toBe('John');
      expect(deactivatedUser.lastName).toBe('Doe');
      expect(deactivatedUser.role).toBe(UserRole.USER);
      expect(deactivatedUser.createdAt).toBe(mockDate);
      expect(deactivatedUser.updatedAt.getTime()).toBeGreaterThan(mockDate.getTime());
    });

    it('should return a new User instance', () => {
      const activeUser = new User(
        mockId,
        'test@example.com',
        'testuser',
        'hashedPassword123',
        'John',
        'Doe',
        true,
        UserRole.USER,
        mockDate,
        mockDate
      );

      const deactivatedUser = activeUser.deactivate();

      expect(deactivatedUser).not.toBe(activeUser);
      expect(deactivatedUser).toBeInstanceOf(User);
    });
  });

  describe('changeRole method', () => {
    it('should change user role to ADMIN', () => {
      const user = new User(
        mockId,
        'test@example.com',
        'testuser',
        'hashedPassword123',
        'John',
        'Doe',
        true,
        UserRole.USER,
        mockDate,
        mockDate
      );

      const updatedUser = user.changeRole(UserRole.ADMIN);

      expect(updatedUser.role).toBe(UserRole.ADMIN);
      expect(updatedUser.id).toBe(mockId);
      expect(updatedUser.email).toBe('test@example.com');
      expect(updatedUser.username).toBe('testuser');
      expect(updatedUser.password).toBe('hashedPassword123');
      expect(updatedUser.firstName).toBe('John');
      expect(updatedUser.lastName).toBe('Doe');
      expect(updatedUser.isActive).toBe(true);
      expect(updatedUser.createdAt).toBe(mockDate);
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(mockDate.getTime());
    });

    it('should change user role to MODERATOR', () => {
      const user = new User(
        mockId,
        'test@example.com',
        'testuser',
        'hashedPassword123',
        'John',
        'Doe',
        true,
        UserRole.USER,
        mockDate,
        mockDate
      );

      const updatedUser = user.changeRole(UserRole.MODERATOR);

      expect(updatedUser.role).toBe(UserRole.MODERATOR);
    });

    it('should return a new User instance', () => {
      const user = new User(
        mockId,
        'test@example.com',
        'testuser',
        'hashedPassword123',
        'John',
        'Doe',
        true,
        UserRole.USER,
        mockDate,
        mockDate
      );

      const updatedUser = user.changeRole(UserRole.ADMIN);

      expect(updatedUser).not.toBe(user);
      expect(updatedUser).toBeInstanceOf(User);
    });
  });

  describe('Immutability', () => {
    it('should not modify original user when calling activate', () => {
      const originalUser = new User(
        mockId,
        'test@example.com',
        'testuser',
        'hashedPassword123',
        'John',
        'Doe',
        false,
        UserRole.USER,
        mockDate,
        mockDate
      );

      const originalIsActive = originalUser.isActive;
      const originalUpdatedAt = originalUser.updatedAt;

      originalUser.activate();

      expect(originalUser.isActive).toBe(originalIsActive);
      expect(originalUser.updatedAt).toBe(originalUpdatedAt);
    });

    it('should not modify original user when calling deactivate', () => {
      const originalUser = new User(
        mockId,
        'test@example.com',
        'testuser',
        'hashedPassword123',
        'John',
        'Doe',
        true,
        UserRole.USER,
        mockDate,
        mockDate
      );

      const originalIsActive = originalUser.isActive;
      const originalUpdatedAt = originalUser.updatedAt;

      originalUser.deactivate();

      expect(originalUser.isActive).toBe(originalIsActive);
      expect(originalUser.updatedAt).toBe(originalUpdatedAt);
    });

    it('should not modify original user when calling changeRole', () => {
      const originalUser = new User(
        mockId,
        'test@example.com',
        'testuser',
        'hashedPassword123',
        'John',
        'Doe',
        true,
        UserRole.USER,
        mockDate,
        mockDate
      );

      const originalRole = originalUser.role;
      const originalUpdatedAt = originalUser.updatedAt;

      originalUser.changeRole(UserRole.ADMIN);

      expect(originalUser.role).toBe(originalRole);
      expect(originalUser.updatedAt).toBe(originalUpdatedAt);
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters in names', () => {
      const user = new User(
        mockId,
        'test@example.com',
        'testuser',
        'hashedPassword123',
        'José María',
        'O\'Connor',
        true,
        UserRole.USER,
        mockDate,
        mockDate
      );

      expect(user.firstName).toBe('José María');
      expect(user.lastName).toBe('O\'Connor');
      expect(user.fullName).toBe('José María O\'Connor');
    });

    it('should handle very long names', () => {
      const longFirstName = 'A'.repeat(100);
      const longLastName = 'B'.repeat(100);

      const user = new User(
        mockId,
        'test@example.com',
        'testuser',
        'hashedPassword123',
        longFirstName,
        longLastName,
        true,
        UserRole.USER,
        mockDate,
        mockDate
      );

      expect(user.firstName).toBe(longFirstName);
      expect(user.lastName).toBe(longLastName);
      expect(user.fullName).toBe(`${longFirstName} ${longLastName}`);
    });
  });
});
