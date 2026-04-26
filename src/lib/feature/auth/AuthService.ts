// src/lib/feature/auth/AuthService.ts
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
    console.log('Attempting login for:', data.username);
  }
}
