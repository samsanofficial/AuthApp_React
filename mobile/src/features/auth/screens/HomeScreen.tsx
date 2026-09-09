import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../../../shared/theme';
import { PrimaryButton } from '../../../shared/ui';
import { FingerprintIcon } from '../../../shared/ui/icons';
import { useAuth } from '../store/AuthContext';

function biometryLabel(type: string | null): string {
  if (type === 'Face' || type === 'FaceID') return 'face unlock';
  if (type === 'Iris') return 'iris unlock';
  return 'fingerprint';
}

export function HomeScreen() {
  const { user, logout, biometricEnabled, biometryType, enableBiometrics, disableBiometrics } =
    useAuth();
  const [busy, setBusy] = useState(false);
  const promptShown = useRef(false);

  const label = biometryLabel(biometryType);

  const toggleBiometrics = async (next: boolean) => {
    setBusy(true);
    try {
      if (next) {
        await enableBiometrics();
      } else {
        await disableBiometrics();
      }
    } catch {
      Alert.alert(
        'Could not update biometric sign-in',
        `We could not save your ${label} preference. Please try again.`,
      );
    } finally {
      setBusy(false);
    }
  };

  // Offer enrolment once per session, right after the user has proved who they
  // are with a password. Asking earlier would have nothing to protect.
  useEffect(() => {
    if (promptShown.current || biometricEnabled || !biometryType) return;
    promptShown.current = true;

    Alert.alert(
      'Enable biometric sign-in?',
      `Use your ${label} to sign in next time instead of typing your password.`,
      [
        { text: 'Not now', style: 'cancel' },
        { text: 'Enable', onPress: () => void toggleBiometrics(true) },
      ],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biometricEnabled, biometryType]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.title}>You are signed in</Text>
        <Text style={styles.name}>{user ? `${user.firstName} ${user.lastName}` : ''}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.card}>
          <View style={styles.cardIcon}>
            <FingerprintIcon size={22} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Biometric sign-in</Text>
            <Text style={styles.cardSubtitle}>
              {biometryType
                ? `Sign in with your ${label}`
                : 'No biometrics enrolled on this device'}
            </Text>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={(next) => void toggleBiometrics(next)}
            disabled={!biometryType || busy}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <PrimaryButton label="Log Out" onPress={() => void logout()} style={styles.button} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xxl },
  title: { ...typography.title, color: colors.textPrimary, textAlign: 'center' },
  name: {
    ...typography.subtitle,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  email: {
    ...typography.subtitle,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xxxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  cardIcon: { marginRight: spacing.md },
  cardText: { flex: 1 },
  cardTitle: { ...typography.social, color: colors.textPrimary },
  cardSubtitle: { ...typography.helper, color: colors.textSecondary, marginTop: 2 },
  button: { marginTop: spacing.xl },
});
