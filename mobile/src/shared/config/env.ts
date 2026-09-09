import { Platform } from 'react-native';

// Android talks to localhost and the port is tunnelled to the host machine with
// `adb reverse tcp:4000 tcp:4000`. That works identically on an emulator and on
// a USB-connected phone, unlike 10.0.2.2 (emulator only) or a LAN IP (changes
// with the network, and is blocked outright on isolated Wi-Fi).
const DEV_API_URL = Platform.select({
  android: 'http://localhost:4000/api',
  ios: 'http://localhost:4000/api',
  default: 'http://localhost:4000/api',
});

export const config = {
  apiUrl: DEV_API_URL,
  requestTimeoutMs: 15000,
} as const;
