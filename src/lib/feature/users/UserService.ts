// src/lib/feature/users/UserService.ts
import argon2 from 'argon2';
import type { UserRepository } from './UserRepository';

export class UserService {
  constructor(
    private repository: UserRepository,
    private container: unknown,
  ) {}

  async getUserById(userId: string) {
    return await this.repository.findById(userId);
  }

  async getUserByUserName(username: string) {
    return await this.repository.findByUsername(username);
  }

  async getUsernameList() {
    return await this.repository.fetchUsernames();
  }

  async updatePassword(userId: string, password: string) {
    const hashedPassword = await argon2.hash(password);
    return await this.repository.updateFieldsById(userId, {
      password: hashedPassword,
      shouldResetPassword: false,
    });
  }

  async updateSecret(userId: string, secret: string) {
    return await this.repository.updateFieldsById(userId, { tOtpSecret: secret });
  }

  async setOTPConfigured(userId: string) {
    return await this.repository.updateFieldsById(userId, { isTotpConfigured: true });
  }
}
