import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, sizes, spacing, typography } from '../theme';

export interface SocialButtonProps {
  label: string;
  icon: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}

export function SocialButton({ label, icon, onPress, disabled = false }: SocialButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
    >
      {icon}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: sizes.control,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: {
    backgroundColor: colors.surfaceRaised,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    ...typography.social,
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
});
