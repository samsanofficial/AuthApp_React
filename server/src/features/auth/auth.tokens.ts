import { createHmac, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  if (typeof decoded === 'string' || !decoded.sub) {
    throw new Error('Malformed access token payload');
  }
  return { sub: String(decoded.sub), email: String((decoded as jwt.JwtPayload).email ?? '') };
}

export function generateRefreshToken(): string {
  return randomBytes(48).toString('base64url');
}

// Peppered with the refresh secret so a database-only leak cannot be brute-forced
// offline against the stored hashes.
export function hashRefreshToken(token: string): string {
  return createHmac('sha256', env.JWT_REFRESH_SECRET).update(token).digest('hex');
}

export function refreshTokenExpiry(): Date {
  return new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export function accessTokenExpiresIn(): string {
  return env.JWT_ACCESS_TTL;
}
