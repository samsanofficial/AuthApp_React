import { randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/AppError';
import * as users from '../users/user.repository';
import { toPublicUser, type PublicUser } from '../users/user.types';
import * as tokens from './auth.repository';
import {
  accessTokenExpiresIn,
  generateRefreshToken,
  hashRefreshToken,
  refreshTokenExpiry,
  signAccessToken,
} from './auth.tokens';
import type { LoginInput, RegisterInput } from './auth.schema';

// Wording comes from the design. Returned for both "no such account" and "wrong
// password" so the response never reveals whether an email is registered.
const INVALID_CREDENTIALS = 'The password you entered is incorrect. Please try again.';

// Comparing against a real hash on the unknown-email path keeps response times
// similar, so timing cannot be used to enumerate accounts. Generated at startup
// from random input so it can never match a real password.
const TIMING_DECOY_HASH = bcrypt.hashSync(randomBytes(32).toString('hex'), env.BCRYPT_ROUNDS);

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}

export interface AuthResult {
  user: PublicUser;
  tokens: AuthTokens;
}

async function issueTokens(userId: string, email: string): Promise<AuthTokens> {
  const accessToken = signAccessToken({ sub: userId, email });
  const refreshToken = generateRefreshToken();

  await tokens.storeRefreshToken(userId, hashRefreshToken(refreshToken), refreshTokenExpiry());

  return { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: accessTokenExpiresIn() };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  if (await users.emailExists(input.email)) {
    throw AppError.conflict('An account with this email already exists', {
      email: 'An account with this email already exists',
    });
  }

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);

  const user = await users.createUser({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    countryCode: input.countryCode,
    phoneNumber: input.phoneNumber,
    passwordHash,
  });

  return { user: toPublicUser(user), tokens: await issueTokens(user.id, user.email) };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await users.findByEmail(input.email);

  if (!user) {
    await bcrypt.compare(input.password, TIMING_DECOY_HASH);
    throw AppError.unauthorized(INVALID_CREDENTIALS);
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password_hash);
  if (!passwordMatches) {
    throw AppError.unauthorized(INVALID_CREDENTIALS);
  }

  return { user: toPublicUser(user), tokens: await issueTokens(user.id, user.email) };
}

export async function refresh(refreshToken: string): Promise<AuthTokens> {
  const tokenHash = hashRefreshToken(refreshToken);
  const stored = await tokens.findRefreshToken(tokenHash);

  if (!stored) {
    throw AppError.unauthorized('Your session has expired. Please sign in again.');
  }

  // A revoked token being presented again means it leaked after rotation, so
  // every session for that user is cut rather than just rejecting this request.
  if (stored.revoked_at) {
    await tokens.revokeAllForUser(stored.user_id);
    throw AppError.unauthorized('Your session has expired. Please sign in again.');
  }

  if (stored.expires_at.getTime() <= Date.now()) {
    throw AppError.unauthorized('Your session has expired. Please sign in again.');
  }

  const user = await users.findById(stored.user_id);
  if (!user) {
    throw AppError.unauthorized('Your session has expired. Please sign in again.');
  }

  await tokens.revokeRefreshToken(tokenHash);
  return issueTokens(user.id, user.email);
}

export async function logout(refreshToken: string): Promise<void> {
  await tokens.revokeRefreshToken(hashRefreshToken(refreshToken));
}

/**
 * Issues an additional refresh token for biometric sign-in on this device.
 *
 * It must be a separate token from the session one: signing out revokes the
 * session token, and if biometrics shared it, enabling biometrics then logging
 * out would leave a dead token behind and the fingerprint could never sign in.
 */
export async function createBiometricToken(userId: string): Promise<string> {
  const refreshToken = generateRefreshToken();
  await tokens.storeRefreshToken(userId, hashRefreshToken(refreshToken), refreshTokenExpiry());
  return refreshToken;
}

export async function revokeBiometricToken(refreshToken: string): Promise<void> {
  await tokens.revokeRefreshToken(hashRefreshToken(refreshToken));
}

export async function getProfile(userId: string): Promise<PublicUser> {
  const user = await users.findById(userId);
  if (!user) throw AppError.notFound('User not found');
  return toPublicUser(user);
}
