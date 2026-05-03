// src/lib/server/middleware/guardMiddleware.ts
import { redirect, type Handle } from '@sveltejs/kit';

const guardMiddleware: Handle = async ({ event, resolve }) => {
  const { user } = event.locals;
  const path = event.url.pathname;

  // 1. Define routes that do NOT require authentication
  const isPublicRoute = path === '/login';

  // 2. Define static assets or internal SvelteKit paths to ignore
  const isInternal = path.startsWith('/_app') || path.startsWith('/favicon.ico');

  if (isInternal) {
    return resolve(event);
  }

  // 3. The Guard Logic
  if (!isPublicRoute && !user) {
    // If it's not a public page and no user exists, send to login
    throw redirect(303, '/login');
  }

  if (path === '/login' && user) {
    // If logged in user tries to access login page, send to root
    throw redirect(303, '/');
  }

  // 4. Force password reset logic
  if (user?.shouldResetPassword && path !== '/reset-password') {
    throw redirect(303, '/reset-password');
  }

  return resolve(event);
};

export default guardMiddleware;
