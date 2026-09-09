import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii, sizes, typography } from '../theme';

export interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
}: PrimaryButtonProps) {
  const notPressable = disabled || loading;

  // Loading keeps the full-strength background so the spinner stays legible;
  // only a genuinely disabled button is dimmed.
  const backgroundFor = (pressed: boolean) => {
    if (disabled) return colors.primaryDisabled;
    if (pressed) return colors.primaryPressed;
    return colors.primary;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={notPressable}
      accessibilityRole="button"
      accessibilityState={{ disabled: notPressable, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: backgroundFor(pressed) },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.onPrimary} size="small" />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: sizes.control,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    // Raised look from the design: a dark shadow cast onto the near-black canvas.
    boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.85)',
  },
  label: {
    ...typography.button,
    color: colors.onPrimary,
  },
});
