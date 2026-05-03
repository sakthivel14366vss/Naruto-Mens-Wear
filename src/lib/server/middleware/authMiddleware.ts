// src/lib/server/middleware/authMiddleware.ts
import type { Handle } from '@sveltejs/kit';
import { verify } from '$lib/server/utils/jwt';

/**
 * Professional JWT Authentication Middleware
 * Aligns with AuthService payload structure.
 */
const authMiddleware: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('session');

  // 1. Initialize user as null (prevents undefined checks later)
  event.locals.user = null;

  if (token) {
    try {
      // 2. Verify and cast the payload
      // Type casting here ensures the rest of the app knows exactly what's in 'user'
      const payload = (await verify(token)) as App.Locals['user'];

      if (payload) {
        // 3. Populate locals for use in +page.server.ts and +server.ts
        event.locals.user = {
          userId: payload.userId,
          username: payload.username,
          role: payload.role,
          shouldResetPassword: payload.shouldResetPassword,
        };
      }
    } catch {
      console.warn('Auth Middleware: Invalid or expired session.');
      event.cookies.delete('session', { path: '/' });
    }
  }

  // 6. Proceed to the next middleware or route handler
  return await resolve(event);
};

export default authMiddleware;
