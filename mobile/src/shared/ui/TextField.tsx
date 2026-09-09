import React, { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors, radii, sizes, spacing, typography } from '../theme';
import { EyeIcon, EyeOffIcon } from './icons';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  secure?: boolean;
  labelAction?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export type TextFieldRef = React.ComponentRef<typeof TextInput>;

export const TextField = forwardRef<TextFieldRef, TextFieldProps>(function TextField(
  { label, error, icon, secure = false, labelAction, containerStyle, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const borderColor = error
    ? colors.borderError
    : focused
      ? colors.borderFocused
      : colors.border;

  return (
    <View style={containerStyle}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {labelAction}
      </View>

      <View style={[styles.field, { borderColor }]}>
        {icon ? <View style={styles.leftIcon}>{icon}</View> : null}

        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secure && !revealed}
          cursorColor={colors.primary}
          selectionColor={colors.primary}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />

        {secure ? (
          <Pressable
            onPress={() => setRevealed((v) => !v)}
            hitSlop={10}
            style={styles.rightIcon}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
          >
            {revealed ? <EyeOffIcon /> : <EyeIcon />}
          </Pressable>
        ) : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    ...typography.label,
    color: colors.textLabel,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: sizes.control,
    borderWidth: 1,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  leftIcon: {
    marginRight: spacing.md,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.input,
    color: colors.textPrimary,
    padding: 0,
  },
  error: {
    ...typography.helper,
    color: colors.error,
    marginTop: spacing.sm,
  },
});
