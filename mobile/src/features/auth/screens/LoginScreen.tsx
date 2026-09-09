import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '../../../shared/theme';
import { Divider, IconButton, PrimaryButton, SocialButton, TextField } from '../../../shared/ui';
import { AppleIcon, FingerprintIcon, GoogleIcon, LockIcon, MailIcon } from '../../../shared/ui/icons';
import { ApiError } from '../../../shared/api/ApiError';
import type { AuthStackParamList } from '../../../app/navigation/types';
import { loginSchema, type LoginFormValues } from '../schemas/auth.schemas';
import { useAuth } from '../store/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login, loginWithBiometrics, biometricEnabled, biometryType } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [biometricBusy, setBiometricBusy] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;

      if (apiError?.fields && Object.keys(apiError.fields).length > 0) {
        for (const [field, message] of Object.entries(apiError.fields)) {
          setError(field as keyof LoginFormValues, { message });
        }
        return;
      }

      // The design puts the credentials error under the password field.
      if (apiError?.status === 401) {
        setError('password', { message: apiError.message });
        return;
      }

      Alert.alert('Unable to sign in', apiError?.message ?? 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const onBiometricPress = async () => {
    if (!biometryType) {
      Alert.alert(
        'Biometrics unavailable',
        'This device has no fingerprint or face unlock enrolled.',
      );
      return;
    }

    if (!biometricEnabled) {
      Alert.alert(
        'Biometric sign-in not set up',
        'Sign in with your password once, then enable biometric sign-in to use it next time.',
      );
      return;
    }

    setBiometricBusy(true);
    try {
      await loginWithBiometrics();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Biometric sign-in failed. Use your password instead.';
      Alert.alert('Biometric sign-in failed', message);
    } finally {
      setBiometricBusy(false);
    }
  };

  const notAvailable = (provider: string) =>
    Alert.alert(`${provider} sign-in`, 'Third-party sign-in is not part of this build.');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back to Cashify</Text>
            <Text style={styles.subtitle}>Your All-in-One Financial Hub</Text>
          </View>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Email Address"
                placeholder="Enter your email"
                icon={<MailIcon />}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                containerStyle={styles.passwordField}
                label="Password"
                placeholder="Enter your password"
                icon={<LockIcon />}
                secure
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                autoCapitalize="none"
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={() => void handleSubmit(onSubmit)()}
                labelAction={
                  <Pressable
                    hitSlop={8}
                    onPress={() =>
                      Alert.alert(
                        'Forgot password',
                        'Password recovery is not part of this build.',
                      )
                    }
                  >
                    <Text style={styles.link}>Forget Password?</Text>
                  </Pressable>
                }
              />
            )}
          />

          <View style={styles.actionRow}>
            <PrimaryButton
              label="Login"
              onPress={handleSubmit(onSubmit)}
              loading={submitting}
              style={styles.loginButton}
            />
            <IconButton
              accessibilityLabel="Sign in with biometrics"
              onPress={() => void onBiometricPress()}
              disabled={biometricBusy}
            >
              <FingerprintIcon />
            </IconButton>
          </View>

          <View style={styles.divider}>
            <Divider label="Or" />
          </View>

          <SocialButton
            label="Login With Apple"
            icon={<AppleIcon />}
            onPress={() => notAvailable('Apple')}
          />
          <View style={styles.socialGap}>
            <SocialButton
              label="Login With Google"
              icon={<GoogleIcon />}
              onPress={() => notAvailable('Google')}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable hitSlop={8} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  header: { alignItems: 'center', marginTop: spacing.xxl, marginBottom: spacing.xxl },
  title: { ...typography.title, color: colors.textPrimary, textAlign: 'center' },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  passwordField: { marginTop: spacing.lg },
  link: { ...typography.link, color: colors.link },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl },
  loginButton: { flex: 1, marginRight: spacing.md },
  divider: { marginVertical: spacing.xl },
  socialGap: { marginTop: spacing.md },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing.xxl,
  },
  footerText: { ...typography.footnote, color: colors.textSecondary },
  footerLink: { ...typography.footnote, color: colors.primary, fontWeight: '700' },
});
