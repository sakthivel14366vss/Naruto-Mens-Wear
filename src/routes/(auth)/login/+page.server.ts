import { formDataToObject } from '$lib/common/utils/form';
import type { AuthService } from '$lib/feature/auth/AuthService';
import type { LoginRequest } from '$lib/feature/auth/types';
import type { UserService } from '$lib/feature/users/UserService';
import { handleResponse } from '$lib/server/utils/response';
import { services } from '$lib/server/utils/serviceContainer';
import { redirect, isRedirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const userService: UserService = await services.get('users');
  return {
    usernames: await userService.getUsernameList(),
  };
};

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    try {
      const formData = await request.formData();
      const payload = formDataToObject(formData) as unknown as LoginRequest;
      const authService: AuthService = await services.get('auth');
      const token = await authService.login(payload);
      cookies.set('session', token, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
        maxAge: 60 * 60 * 15, // 15 hour
      });
      throw redirect(303, '/');
    } catch (error) {
      // CRITICAL: Re-throw if it's a redirect
      if (isRedirect(error)) throw error;

      // Professional error handling:
      // Ensure handleResponse returns a POJO via SvelteKit's fail()
      return handleResponse(error);
    }
  },
};
