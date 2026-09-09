import { api } from '../../../shared/api/client';
import { toApiError } from '../../../shared/api/ApiError';
import { config } from '../../../shared/config/env';
import axios from 'axios';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

// Bypasses the shared client so the refresh call can never be intercepted and
// retried by the very logic that handles expired sessions.
export async function refresh(refreshToken: string): Promise<AuthTokens> {
  try {
    const { data } = await axios.post<{ tokens: AuthTokens }>(
      `${config.apiUrl}/auth/refresh`,
      { refreshToken },
      { timeout: config.requestTimeoutMs },
    );
    return data.tokens;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function logout(refreshToken: string): Promise<void> {
  try {
    await api.post('/auth/logout', { refreshToken });
  } catch {
    // Signing out locally must succeed even if the server call fails.
  }
}

export async function createBiometricToken(): Promise<string> {
  try {
    const { data } = await api.post<{ refreshToken: string }>('/auth/biometric/token');
    return data.refreshToken;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function revokeBiometricToken(refreshToken: string): Promise<void> {
  try {
    await api.post('/auth/biometric/revoke', { refreshToken });
  } catch {
    // Turning biometrics off locally must succeed even if the server call fails.
  }
}

export async function me(): Promise<AuthUser> {
  try {
    const { data } = await api.get<{ user: AuthUser }>('/auth/me');
    return data.user;
  } catch (error) {
    throw toApiError(error);
  }
}
