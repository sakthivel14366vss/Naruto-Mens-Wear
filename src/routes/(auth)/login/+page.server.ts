import { formDataToObject } from '$lib/common/utils/form';
import type { AuthService } from '$lib/feature/auth/AuthService';
import type { LoginRequest } from '$lib/feature/auth/types';
import type { UserService } from '$lib/feature/users/UserService';
import { services } from '$lib/server/utils/serviceContainer';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const userService: UserService = await services.get('users');
  return {
    usernames: await userService.getUsernameList(),
  };
};

export const actions: Actions = {
  login: async ({ request }) => {
    const formData = await request.formData();
    const payload = formDataToObject(formData) as unknown as LoginRequest;
    const authService: AuthService = await services.get('auth');
    await authService.login(payload);
  },
};
