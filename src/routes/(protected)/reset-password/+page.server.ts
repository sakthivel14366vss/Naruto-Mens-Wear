// src\routes\(protected)\reset-password\+page.server.ts
import { PUBLIC_APP_NAME } from '$env/static/public';
import { formDataToObject } from '$lib/common/utils/form.js';
import { serializeDoc } from '$lib/common/utils/serializer.js';
import type { AuthService } from '$lib/feature/auth/AuthService.js';
import type { changePasswordRequest } from '$lib/feature/auth/types.js';
import type { User } from '$lib/feature/users/UserModel.js';
import type { UserService } from '$lib/feature/users/UserService.js';
import { services } from '$lib/server/utils/serviceContainer.js';
import type { Actions } from './$types';
import { handlePageCatch } from '$lib/server/utils/response.js';
import { redirect } from '@sveltejs/kit';
import { generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode';

export const load = async ({ locals }) => {
  const userId = locals.user?.userId || '';
  const userService: UserService = await services.get('users');
  const user: User | null = await userService.getUserById(userId);
  let currentStep = 1;
  let qrCodeUrl = '';
  let secret = '';

  if (user?.shouldResetPassword) currentStep = 1;
  else if (!user?.shouldResetPassword && !user?.tOtpSecret) currentStep = 2;
  else if (!user?.shouldResetPassword && user?.tOtpSecret) currentStep = 3;

  if (currentStep === 2) {
    secret = generateSecret();
    const uri = generateURI({
      issuer: PUBLIC_APP_NAME,
      label: user?.username || 'User',
      secret,
    });
    qrCodeUrl = await QRCode.toDataURL(uri, {
      margin: 2,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  }

  return { currentStep, user: serializeDoc(user), secret, qrCodeUrl };
};

export const actions: Actions = {
  changePassword: async ({ request, locals }) => {
    try {
      const userId = locals.user?.userId || '';
      const data = formDataToObject(await request.formData()) as unknown as changePasswordRequest;
      const authService: AuthService = await services.get('auth');
      await authService.changePassword(userId, data);
      throw redirect(301, '/reset-password');
    } catch (error) {
      return handlePageCatch(error);
    }
  },

  configureTOTP: async ({ request, locals }) => {
    try {
      const userId = locals.user?.userId || '';
      const data = formDataToObject(await request.formData()) as unknown as { secret: string };
      const authService: AuthService = await services.get('auth');
      await authService.updateTotpSecret(userId, data);
      throw redirect(301, '/reset-password');
    } catch (error) {
      return handlePageCatch(error);
    }
  },

  verifyTOTP: async ({ request, locals }) => {
    try {
      const userId = locals.user?.userId || '';
      const data = formDataToObject(await request.formData()) as unknown as { totp: string };
      const authService: AuthService = await services.get('auth');
      await authService.verifyTOTP(userId, data);
      throw redirect(301, '/');
    } catch (error) {
      return handlePageCatch(error);
    }
  },
};
