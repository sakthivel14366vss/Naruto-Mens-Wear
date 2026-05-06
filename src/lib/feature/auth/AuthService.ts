// src/lib/feature/auth/AuthService.ts
import AppError, { handleDBResult } from '$lib/server/utils/response';
import type { services } from '$lib/server/utils/serviceContainer';
import argon2 from 'argon2';
import type { UserService } from '../users/UserService';
import type { changePasswordRequest, LoginRequest } from './types';
import { sign } from '$lib/server/utils/jwt';
import { verify } from 'otplib';
import type { User } from '../users/UserModel';

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

  async changePassword(userId: string, data: changePasswordRequest) {
    if (data.newPassword !== data.confirmPassword) throw new AppError('Password does not match');
    const userService: UserService = await this.getUserService();
    const result = await userService.updatePassword(userId, data.newPassword);
    return handleDBResult(result);
  }

  async updateTotpSecret(userId: string, data: { secret: string }) {
    if (!data.secret) throw new AppError('Secret Key is missing');
    const userService: UserService = await this.getUserService();
    const result = await userService.updateSecret(userId, data.secret);
    return handleDBResult(result);
  }

  async verifyTOTP(userId: string, data: { totp: string }) {
    if (!data.totp) throw new AppError('TOTP is missing');
    const userService: UserService = await this.getUserService();
    const user: User | null = await userService.getUserById(userId);
    if (!user) throw new AppError('User not found');

    const verification = await verify({
      secret: user.tOtpSecret,
      token: data.totp.toString(),
    });
    if (!verification.valid) throw new AppError('Invalid OTP');
    const result = await userService.setOTPConfigured(userId);
    return handleDBResult(result);
  }
}
