import { Platform } from 'react-native';
import { colors } from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const sizes = {
  control: 52,
  iconButton: 52,
  icon: 20,
} as const;

const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const typography = {
  title: { fontFamily, fontSize: 21, fontWeight: '700', letterSpacing: -0.2 },
  subtitle: { fontFamily, fontSize: 12.5, fontWeight: '400' },
  label: { fontFamily, fontSize: 12.5, fontWeight: '500' },
  input: { fontFamily, fontSize: 14.5, fontWeight: '400' },
  button: { fontFamily, fontSize: 15, fontWeight: '700' },
  social: { fontFamily, fontSize: 14, fontWeight: '600' },
  helper: { fontFamily, fontSize: 11.5, fontWeight: '400' },
  link: { fontFamily, fontSize: 12.5, fontWeight: '600' },
  footnote: { fontFamily, fontSize: 12.5, fontWeight: '400' },
} as const;

export const theme = { colors, spacing, radii, sizes, typography } as const;

export { colors };
