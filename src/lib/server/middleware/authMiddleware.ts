// src\lib\server\middleware\authMiddleware.ts
import type { Handle } from '@sveltejs/kit';
import { verify } from '../utils/jwt';

/**
 * A JWT auth middleware handler.
 */
const authMiddleware: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('token');
  const payload = verify(token);
  return new Response('Testing');
};

export default authMiddleware;
