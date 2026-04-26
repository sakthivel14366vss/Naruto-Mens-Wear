// src/lib/feature/users/UserRepository.ts
import BaseRepository from '../base/BaseRepository';
import type { User } from './UserModel';
import type { Db } from 'mongodb';

export class UserRepository extends BaseRepository<User> {
  constructor(db: Db) {
    super(db, 'users');
  }

  async findByUsername(username: string) {
    return await this.collection.findOne({ username });
  }

  async fetchUsernames(): Promise<string[]> {
    const users = await this.collection
      .find({ isOut: true }, { projection: { username: 1, _id: 0 } })
      .toArray();
    return users.map((user) => user.username);
  }
}
