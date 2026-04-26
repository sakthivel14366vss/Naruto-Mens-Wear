// src/lib/server/utils/serviceContainer.ts
import { connectDB } from './mongodb';
import { type Db } from 'mongodb';
import { UserRepository } from '$lib/feature/users/UserRepository';
import { UserService } from '$lib/feature/users/UserService';
import { AuthService } from '$lib/feature/auth/AuthService';

const cache = new Map();
let db: Db | null = null;

const registry = {
  users: (db: Db) => new UserService(new UserRepository(db), services),
  auth: () => new AuthService(services),
};

export const services = {
  async get(name: keyof typeof registry) {
    // Check cache first
    if (cache.has(name)) return cache.get(name);

    // Only connect DB if it's the first time any service is called
    if (!db) db = await connectDB();

    // Create the service using the registry recipe
    const instance = registry[name](db);
    cache.set(name, instance);

    return instance;
  },
};
