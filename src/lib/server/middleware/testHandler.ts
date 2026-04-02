// src/lib/server/middleware/testHandler.ts

import { dateTimeUtils } from '$lib/common/utils/dateTimeFormat';
import type { Handle } from '@sveltejs/kit';

/**
 * A basic test middleware handler.
 */
const testHandler: Handle = async () => {
  const testString = new Date();
  console.log(testString, dateTimeUtils.date(testString));
  console.log(testString, dateTimeUtils.time(testString));
  console.log(testString, dateTimeUtils.full(testString));
  return new Response('Testing');
};

export default testHandler;
