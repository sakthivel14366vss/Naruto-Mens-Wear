// src/lib/feature/auth/AuthService.ts
import AppError from '$lib/server/utils/response';
import type { services } from '$lib/server/utils/serviceContainer';
import type { UserService } from '../users/UserService';
import type { LoginRequest } from './types';

export class AuthService {
  constructor(private container: typeof services) {}

  private async getUserService() {
    return await this.container.get('users');
  }

  async login(data: LoginRequest) {
    const userService: UserService = await this.getUserService();
    const user = await userService.getUserByUserName(data.username);
    if (!user) throw new AppError('Username not found');
  }
}
