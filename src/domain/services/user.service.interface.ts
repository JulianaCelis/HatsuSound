import { User } from '../entities/user.entity';

export interface IUserService {
  createUser(
    email: string,
    username: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<User>;
  
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  
  updateUser(id: string, userData: Partial<User>): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;
  
  validateUserCredentials(emailOrUsername: string, password: string): Promise<User | null>;
  activateUser(id: string): Promise<User | null>;
  deactivateUser(id: string): Promise<User | null>;
  changeUserRole(id: string, role: string): Promise<User | null>;
  
  isEmailUnique(email: string): Promise<boolean>;
  isUsernameUnique(username: string): Promise<boolean>;
}
