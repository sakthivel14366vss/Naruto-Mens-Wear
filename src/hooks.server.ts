// src\hooks.server.ts
import type { Handle, ServerInit } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { connectDB } from '$lib/server/utils/mongodb';
// import authMiddleware from '$lib/server/middleware/authMiddleware';
// import testHandler from '$lib/server/middleware/testHandler';

/**
 * Runs once when the server starts.
 * Ideal for initializing database connections or global caches.
 */
export const init: ServerInit = async () => {
  await connectDB();
};

/**
 * Example Middleware: Custom Route Interceptor
 * Keeping logic separated makes testing and maintenance much easier.
 */
// const customRouteHandler: Handle = async ({ event, resolve }) => {
//   console.log('customRouteHandler1');
//   return resolve(event);
// };

/**
 * Primary Handle: Uses 'sequence' to pipe the event through multiple functions.
 * This is the standard "professional" way to manage multiple hooks.
 */
export const handle: Handle = sequence();
// export const handle: Handle = sequence(authMiddleware);
// customRouteHandler,
// Add more hooks here (auth, logging, etc.)
// testHandler,
