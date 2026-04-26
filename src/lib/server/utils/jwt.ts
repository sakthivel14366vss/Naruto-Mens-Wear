import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { JWT_SECRET } from '$env/static/private';

// In a real project, pull this from your environment variables
// Example: import { JWT_SECRET } from '$env/static/private';
const SECRET = new TextEncoder().encode(JWT_SECRET || 'a-very-long-and-secure-random-secret-key');

/**
 * Signs a payload and returns a stateless JWT string.
 * @param payload - The data you want to store (e.g., { userId: '123' })
 * @param expiresIn - How long the token is valid (e.g., '15m', '2h', '7d')
 */
export async function sign(payload: JWTPayload, expiresIn: string = '15m'): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .setExpirationTime(expiresIn)
    .sign(SECRET);
}

/**
 * Verifies a JWT string and returns the decoded payload.
 * Returns null if the token is invalid or expired.
 */
export async function verify<T = JWTPayload>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      algorithms: ['HS256'],
    });
    return payload as T;
  } catch (error) {
    // Log error if needed (e.g., 'JWTExpired' or 'JWTSignatureVerificationFailed')
    console.log(error);
    return null;
  }
}
