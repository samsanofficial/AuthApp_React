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
  md: 14,
  lg: 16,
  pill: 999,
} as const;

export const sizes = {
  control: 54,
  iconButton: 54,
  icon: 20,
} as const;

// Inter is bundled in assets/fonts. On Android the family name is the file
// name, so each weight is referenced explicitly instead of via fontWeight,
// which would otherwise trigger synthetic bolding.
export const fonts = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
} as const;

export const typography = {
  title: { fontFamily: fonts.bold, fontSize: 23, letterSpacing: -0.4 },
  subtitle: { fontFamily: fonts.regular, fontSize: 13.5 },
  label: { fontFamily: fonts.semiBold, fontSize: 14 },
  input: { fontFamily: fonts.regular, fontSize: 15 },
  button: { fontFamily: fonts.bold, fontSize: 16 },
  social: { fontFamily: fonts.bold, fontSize: 15 },
  helper: { fontFamily: fonts.regular, fontSize: 12.5 },
  link: { fontFamily: fonts.semiBold, fontSize: 13.5 },
  footnote: { fontFamily: fonts.regular, fontSize: 13.5 },
  footnoteStrong: { fontFamily: fonts.bold, fontSize: 13.5 },
} as const;

export const theme = { colors, spacing, radii, sizes, typography, fonts } as const;

export { colors };
