// src/lib/feature/users/UserService.ts
import type { UserRepository } from './UserRepository';

export class UserService {
  constructor(
    private repository: UserRepository,
    private container: unknown,
  ) {}

  async getUserByUserName(username: string) {
    return await this.repository.findByUsername(username);
  }

  async getUsernameList() {
    return await this.repository.fetchUsernames();
  }
}
