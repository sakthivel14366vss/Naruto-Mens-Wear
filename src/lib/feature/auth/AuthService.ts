// src/lib/feature/auth/AuthService.ts
import AppError from '$lib/server/utils/response';
import type { services } from '$lib/server/utils/serviceContainer';
import argon2 from 'argon2';
import type { UserService } from '../users/UserService';
import type { LoginRequest } from './types';
import { sign } from '$lib/server/utils/jwt';

export class AuthService {
  constructor(private container: typeof services) {}

  private async getUserService() {
    return await this.container.get('users');
  }

  async login(data: LoginRequest) {
    const userService: UserService = await this.getUserService();
    const user = await userService.getUserByUserName(data.username);
    if (!user) throw new AppError('Username not found');
    if (!user.isActive) throw new AppError('User Deactivated');

    // Verify Password
    const verification = await argon2.verify(user.password, data.password);
    if (!verification) throw new AppError('Password is Incorrect');

    // Generate JWT Token
    const payload = {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
      shouldResetPassword: user.shouldResetPassword,
      isTotpConfigured: user.isTotpConfigured,
    };
    const token = await sign(payload, '15h');
    return token;
  }
}
