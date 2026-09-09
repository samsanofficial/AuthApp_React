export const colors = {
  background: '#0B0B0C',
  surface: '#141416',
  surfaceRaised: '#1C1C1F',

  border: '#2C2C30',
  borderFocused: '#C9F24D',
  borderError: '#FF5A5F',

  primary: '#C9F24D',
  primaryPressed: '#B2DA3C',
  primaryDisabled: '#5C6E2A',
  onPrimary: '#101010',

  textPrimary: '#FFFFFF',
  // Field labels sit brighter than the subtitle in the design, so they get
  // their own token rather than sharing the muted secondary grey.
  textLabel: '#E8E8EA',
  textSecondary: '#8E8E93',
  textMuted: '#6E6E76',
  placeholder: '#8A8A8F',

  error: '#FF5A5F',
  link: '#6C63FF',

  white: '#FFFFFF',
} as const;

export type ColorName = keyof typeof colors;
