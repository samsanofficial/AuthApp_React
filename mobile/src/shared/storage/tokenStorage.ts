import * as Keychain from 'react-native-keychain';

const SESSION_SERVICE = 'com.authenticator.session';
const BIOMETRIC_SERVICE = 'com.authenticator.biometric';

// The access token is deliberately kept in memory only: it is short lived, and
// writing it to disk would widen the attack surface for no benefit.
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export async function saveRefreshToken(token: string): Promise<void> {
  await Keychain.setGenericPassword('refresh', token, {
    service: SESSION_SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function getRefreshToken(): Promise<string | null> {
  const stored = await Keychain.getGenericPassword({ service: SESSION_SERVICE });
  return stored ? stored.password : null;
}

export async function clearRefreshToken(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SESSION_SERVICE });
}

/**
 * Stores a refresh token behind the device biometric prompt. Retrieval triggers
 * the fingerprint sheet, so the token is only readable by the enrolled user.
 */
export async function saveBiometricToken(token: string): Promise<void> {
  await Keychain.setGenericPassword('biometric', token, {
    service: BIOMETRIC_SERVICE,
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
  });
}

export async function getBiometricToken(promptTitle: string): Promise<string | null> {
  const stored = await Keychain.getGenericPassword({
    service: BIOMETRIC_SERVICE,
    authenticationPrompt: { title: promptTitle },
  });
  return stored ? stored.password : null;
}

export async function clearBiometricToken(): Promise<void> {
  await Keychain.resetGenericPassword({ service: BIOMETRIC_SERVICE });
}

export async function hasBiometricToken(): Promise<boolean> {
  const result = await Keychain.hasGenericPassword({ service: BIOMETRIC_SERVICE });
  return result;
}

export async function getSupportedBiometry(): Promise<Keychain.BIOMETRY_TYPE | null> {
  return Keychain.getSupportedBiometryType();
}

export async function clearAll(): Promise<void> {
  setAccessToken(null);
  await Promise.all([clearRefreshToken(), clearBiometricToken()]);
}
