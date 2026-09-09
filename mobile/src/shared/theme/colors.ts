export const colors = {
  background: '#0F0F0F',
  surface: '#161618',
  surfaceRaised: '#1C1C1F',

  border: '#2A2A2E',
  borderFocused: '#C9F24D',
  borderError: '#FF5A5F',

  primary: '#C9F24D',
  primaryPressed: '#B2DA3C',
  primaryDisabled: '#5C6E2A',
  onPrimary: '#101010',

  textPrimary: '#FFFFFF',
  textSecondary: '#9A9AA0',
  textMuted: '#6E6E76',
  placeholder: '#5C5C63',

  error: '#FF5A5F',
  link: '#5B9BFF',

  white: '#FFFFFF',
} as const;

export type ColorName = keyof typeof colors;
