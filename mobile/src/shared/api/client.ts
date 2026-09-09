import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { config } from '../config/env';
import {
  getAccessToken,
  getRefreshToken,
  saveRefreshToken,
  setAccessToken,
} from '../storage/tokenStorage';
import { toApiError } from './ApiError';

export const api = axios.create({
  baseURL: config.apiUrl,
  timeout: config.requestTimeoutMs,
  headers: { 'Content-Type': 'application/json' },
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// Called when refreshing fails, so the app can drop the user back to sign-in.
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

api.interceptors.request.use((request) => {
  const token = getAccessToken();
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

// A single in-flight refresh shared by every request that got a 401, so a burst
// of parallel calls cannot each rotate the refresh token and invalidate one another.
let refreshInFlight: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await axios.post(
      `${config.apiUrl}/auth/refresh`,
      { refreshToken },
      { timeout: config.requestTimeoutMs },
    );
    const tokens = response.data?.tokens;
    if (!tokens?.accessToken || !tokens?.refreshToken) return null;

    setAccessToken(tokens.accessToken);
    await saveRefreshToken(tokens.refreshToken);
    return tokens.accessToken;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error?.config as RetriableConfig | undefined;
    const status = error?.response?.status;
    const isAuthCall = typeof original?.url === 'string' && original.url.includes('/auth/');

    // Only a 401 on a normal request is worth retrying. Failures on the auth
    // endpoints themselves are real credential errors and must reach the caller.
    if (status !== 401 || !original || original._retried || isAuthCall) {
      return Promise.reject(toApiError(error));
    }

    original._retried = true;

    refreshInFlight = refreshInFlight ?? performRefresh();
    const newToken = await refreshInFlight;
    refreshInFlight = null;

    if (!newToken) {
      onSessionExpired?.();
      return Promise.reject(toApiError(error));
    }

    original.headers.Authorization = `Bearer ${newToken}`;
    return api(original as AxiosRequestConfig);
  },
);
