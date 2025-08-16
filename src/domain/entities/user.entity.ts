import { BaseEntity } from './base.entity';

export class User extends BaseEntity {
  constructor(
    id: string,
    public readonly email: string,
    public readonly username: string,
    public readonly password: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly isActive: boolean,
    public readonly role: UserRole,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(
    email: string,
    username: string,
    password: string,
    firstName: string,
    lastName: string,
  ): User {
    const now = new Date();
    const id = this.generateId();
    
    return new User(
      id,
      email,
      username,
      password,
      firstName,
      lastName,
      true, // isActive
      UserRole.USER, // default role
      now,
      now,
    );
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  activate(): User {
    return new User(
      this.id,
      this.email,
      this.username,
      this.password,
      this.firstName,
      this.lastName,
      true,
      this.role,
      this.createdAt,
      new Date(),
    );
  }

  deactivate(): User {
    return new User(
      this.id,
      this.email,
      this.username,
      this.password,
      this.firstName,
      this.lastName,
      false,
      this.role,
      this.createdAt,
      new Date(),
    );
  }

  changeRole(newRole: UserRole): User {
    return new User(
      this.id,
      this.email,
      this.username,
      this.password,
      this.firstName,
      this.lastName,
      this.isActive,
      newRole,
      this.createdAt,
      new Date(),
    );
  }

  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}
