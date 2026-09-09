import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../../shared/theme';
import { PrimaryButton } from '../../../shared/ui';
import { useAuth } from '../store/AuthContext';

export function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.title}>You are signed in</Text>
        <Text style={styles.subtitle}>
          {user ? `${user.firstName} ${user.lastName}` : ''}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>

        <PrimaryButton label="Log Out" onPress={() => void logout()} style={styles.button} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xxl },
  title: { ...typography.title, color: colors.textPrimary, textAlign: 'center' },
  subtitle: {
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
  button: { marginTop: spacing.xxxl },
});
