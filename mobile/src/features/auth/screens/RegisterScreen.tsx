import React, { useRef, useState } from 'react';
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
import { CountryPicker, PrimaryButton, TextField } from '../../../shared/ui';
import type { TextFieldRef } from '../../../shared/ui/TextField';
import { LockIcon, MailIcon, PhoneIcon, UserIcon } from '../../../shared/ui/icons';
import { ApiError } from '../../../shared/api/ApiError';
import {
  DEFAULT_COUNTRY_CODE,
  findCountry,
  phoneLengthRange,
} from '../../../shared/data/countries';
import type { AuthStackParamList } from '../../../app/navigation/types';
import { registerSchema, type RegisterFormValues } from '../schemas/auth.schemas';
import { useAuth } from '../store/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const lastNameRef = useRef<TextFieldRef>(null);
  const phoneRef = useRef<TextFieldRef>(null);
  const emailRef = useRef<TextFieldRef>(null);
  const passwordRef = useRef<TextFieldRef>(null);
  const confirmRef = useRef<TextFieldRef>(null);

  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      countryCode: DEFAULT_COUNTRY_CODE,
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onSubmit',
    // Re-check as the user types once they have submitted, so corrected fields
    // stop showing stale errors.
    reValidateMode: 'onChange',
  });

  const countryCode = watch('countryCode');
  const selectedCountry = findCountry(countryCode);
  const [, maxPhoneDigits] = phoneLengthRange(countryCode);

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitting(true);
    try {
      // The server stores one canonical number, so the dial code and the local
      // digits are combined before sending.
      const localDigits = values.phoneNumber.replace(/\D/g, '');
      const dialDigits = (selectedCountry?.dialCode ?? '').replace(/\D/g, '');

      await register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        countryCode: values.countryCode,
        phoneNumber: `+${dialDigits}${localDigits}`,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;

      if (apiError && Object.keys(apiError.fields).length > 0) {
        for (const [field, message] of Object.entries(apiError.fields)) {
          setError(field as keyof RegisterFormValues, { message });
        }
        return;
      }

      Alert.alert(
        'Unable to create account',
        apiError?.message ?? 'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Your Cashify Account</Text>
            <Text style={styles.subtitle}>Your All-in-One Financial Hub</Text>
          </View>

          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="First Name"
                placeholder="Enter your first name"
                icon={<UserIcon />}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.firstName?.message}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => lastNameRef.current?.focus()}
              />
            )}
          />

          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                ref={lastNameRef}
                containerStyle={styles.gap}
                label="Last Name"
                placeholder="Enter your last name"
                icon={<UserIcon />}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.lastName?.message}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
              />
            )}
          />

          <Controller
            control={control}
            name="countryCode"
            render={({ field: { onChange, value } }) => (
              <CountryPicker
                containerStyle={styles.gap}
                label="Country"
                value={value}
                onChange={onChange}
                error={errors.countryCode?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                ref={phoneRef}
                containerStyle={styles.gap}
                label="Phone Number"
                placeholder="Enter your phone number"
                icon={
                  <View style={styles.phonePrefix}>
                    <PhoneIcon />
                    <Text style={styles.dialCode}>{selectedCountry?.dialCode ?? ''}</Text>
                  </View>
                }
                value={value}
                // phone-pad offers + * # and spaces; strip anything that is not
                // a digit so the field can only ever hold a valid number.
                onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ''))}
                onBlur={onBlur}
                error={errors.phoneNumber?.message}
                keyboardType="phone-pad"
                maxLength={maxPhoneDigits}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                ref={emailRef}
                containerStyle={styles.gap}
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
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                ref={passwordRef}
                containerStyle={styles.gap}
                label="Password"
                placeholder="Create a password"
                icon={<LockIcon />}
                secure
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                ref={confirmRef}
                containerStyle={styles.gap}
                label="Confirm Password"
                placeholder="Re-enter your password"
                icon={<LockIcon />}
                secure
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={() => void handleSubmit(onSubmit)()}
              />
            )}
          />

          <PrimaryButton
            label="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={submitting}
            style={styles.submit}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable hitSlop={8} onPress={() => navigation.goBack()}>
              <Text style={styles.footerLink}>Login</Text>
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
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xxl, paddingBottom: spacing.xl },
  header: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xl },
  title: { ...typography.title, color: colors.textPrimary, textAlign: 'center' },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  gap: { marginTop: spacing.lg },
  phonePrefix: { flexDirection: 'row', alignItems: 'center' },
  dialCode: { ...typography.input, color: colors.textSecondary, marginLeft: spacing.sm },
  submit: { marginTop: spacing.xl },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },
  footerText: { ...typography.footnote, color: colors.textSecondary },
  footerLink: { ...typography.footnoteStrong, color: colors.primary },
});
