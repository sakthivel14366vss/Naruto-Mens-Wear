// src\lib\feature\users\UserModel.ts
import type { Document } from 'mongodb';
export interface User extends Document {
  username: string;
  password: string;
  role: string;
  isActive: boolean;
  isOut: boolean;
  shouldResetPassword: boolean;
  isTotpConfigured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
