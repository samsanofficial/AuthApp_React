import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setSessionExpiredHandler } from '../../../shared/api/client';
import * as storage from '../../../shared/storage/tokenStorage';
import * as authApi from '../api/auth.api';
import type { AuthResponse, AuthUser, RegisterPayload } from '../api/auth.api';

type Status = 'initialising' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: Status;
  user: AuthUser | null;
  biometricEnabled: boolean;
  biometryType: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  loginWithBiometrics: () => Promise<void>;
  enableBiometrics: () => Promise<void>;
  disableBiometrics: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('initialising');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometryType, setBiometryType] = useState<string | null>(null);

  const applySession = useCallback(async (response: AuthResponse) => {
    storage.setAccessToken(response.tokens.accessToken);
    await storage.saveRefreshToken(response.tokens.refreshToken);
    setUser(response.user);
    setStatus('authenticated');
  }, []);

  const signOutLocally = useCallback(async () => {
    await storage.clearAll();
    setUser(null);
    setBiometricEnabled(false);
    setStatus('unauthenticated');
  }, []);

  // Restore a session on cold start: a stored refresh token is exchanged for a
  // fresh access token, so a returning user does not have to sign in again.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [supported, hasBiometric] = await Promise.all([
          storage.getSupportedBiometry(),
          storage.hasBiometricToken(),
        ]);
        if (!cancelled) {
          setBiometryType(supported ?? null);
          setBiometricEnabled(hasBiometric);
        }

        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) {
          if (!cancelled) setStatus('unauthenticated');
          return;
        }

        const tokens = await authApi.refresh(refreshToken);
        storage.setAccessToken(tokens.accessToken);
        await storage.saveRefreshToken(tokens.refreshToken);
        const profile = await authApi.me();

        if (!cancelled) {
          setUser(profile);
          setStatus('authenticated');
        }
      } catch {
        if (!cancelled) {
          await storage.clearRefreshToken();
          storage.setAccessToken(null);
          setStatus('unauthenticated');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      void signOutLocally();
    });
    return () => setSessionExpiredHandler(null);
  }, [signOutLocally]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.login(email, password);
      await applySession(response);
    },
    [applySession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await authApi.register(payload);
      await applySession(response);
    },
    [applySession],
  );

  const enableBiometrics = useCallback(async () => {
    const refreshToken = await storage.getRefreshToken();
    if (!refreshToken) throw new Error('No active session to protect');
    await storage.saveBiometricToken(refreshToken);
    setBiometricEnabled(true);
  }, []);

  const disableBiometrics = useCallback(async () => {
    await storage.clearBiometricToken();
    setBiometricEnabled(false);
  }, []);

  const loginWithBiometrics = useCallback(async () => {
    const stored = await storage.getBiometricToken('Confirm your identity to sign in');
    if (!stored) throw new Error('Biometric sign-in is not set up on this device');

    const tokens = await authApi.refresh(stored);
    storage.setAccessToken(tokens.accessToken);
    await storage.saveRefreshToken(tokens.refreshToken);
    // The stored token has now been rotated away, so replace it with the new one.
    await storage.saveBiometricToken(tokens.refreshToken);

    const profile = await authApi.me();
    setUser(profile);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = await storage.getRefreshToken();
    if (refreshToken) await authApi.logout(refreshToken);
    await signOutLocally();
  }, [signOutLocally]);

  const value = useMemo(
    () => ({
      status,
      user,
      biometricEnabled,
      biometryType,
      login,
      register,
      loginWithBiometrics,
      enableBiometrics,
      disableBiometrics,
      logout,
    }),
    [
      status,
      user,
      biometricEnabled,
      biometryType,
      login,
      register,
      loginWithBiometrics,
      enableBiometrics,
      disableBiometrics,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
