import { Platform } from 'react-native';

// The Android emulator reaches the host machine on 10.0.2.2, not localhost.
// On a physical device, replace this with the LAN IP of the machine running the API.
const DEV_API_URL = Platform.select({
  android: 'http://10.0.2.2:4000/api',
  ios: 'http://localhost:4000/api',
  default: 'http://localhost:4000/api',
});

export const config = {
  apiUrl: DEV_API_URL,
  requestTimeoutMs: 15000,
} as const;
