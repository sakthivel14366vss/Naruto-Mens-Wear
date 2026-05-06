// src/lib/server/middleware/guardMiddleware.ts
import type { UserService } from '$lib/feature/users/UserService';
import { redirect, type Handle } from '@sveltejs/kit';
import { services } from '../utils/serviceContainer';

const guardMiddleware: Handle = async ({ event, resolve }) => {
  const userId = event.locals.user?.userId || '';
  const userService: UserService = await services.get('users');
  const user = await userService.getUserById(userId);
  const path = event.url.pathname;

  // 1. Routes and Assets definitions
  const isPublicRoute = path === '/login';
  const isInternal = path.startsWith('/_app') || path.startsWith('/favicon.ico');
  const isResetPath = path === '/reset-password';

  if (isInternal) {
    return resolve(event);
  }

  // 2. Guest Guard: Redirect unauthenticated users to login
  if (!user && !isPublicRoute) {
    // Optional: If you want /reset-password to be strictly private,
    // remove !isResetPath from the line above.
    throw redirect(303, '/login');
  }

  // 3. Authenticated Guard: Redirect logged-in users away from login
  if (user && isPublicRoute) {
    throw redirect(303, '/');
  }

  // 4. Force Logic: ONLY run if user is logged in
  if (user) {
    const needsSetup = user.shouldResetPassword || !user.isTotpConfigured;

    if (needsSetup && !isResetPath) {
      throw redirect(303, '/reset-password');
    }
  }

  return resolve(event);
};

export default guardMiddleware;
