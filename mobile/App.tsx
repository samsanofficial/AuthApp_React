import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from './src/shared/theme';
import { Divider, IconButton, PrimaryButton, SocialButton, TextField } from './src/shared/ui';
import { AppleIcon, FingerprintIcon, GoogleIcon, LockIcon, MailIcon } from './src/shared/ui/icons';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Welcome Back to Cashify</Text>
          <Text style={styles.subtitle}>Your All-in-One Financial Hub</Text>

          <View style={styles.form}>
            <TextField
              label="Email Address"
              placeholder="Enter your email"
              defaultValue="nazmulshanto90@gmail.com"
              icon={<MailIcon />}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextField
              containerStyle={styles.gap}
              label="Password"
              placeholder="Enter your password"
              icon={<LockIcon />}
              secure
              labelAction={<Text style={styles.link}>Forget Password?</Text>}
            />

            <TextField
              containerStyle={styles.gap}
              label="Password (error state)"
              defaultValue="secret123"
              icon={<LockIcon />}
              secure
              error="The password you entered is incorrect. Please try again."
              labelAction={<Text style={styles.link}>Forget Password?</Text>}
            />

            <View style={styles.actionRow}>
              <PrimaryButton label="Login" style={styles.loginButton} />
              <IconButton accessibilityLabel="Login with biometrics">
                <FingerprintIcon />
              </IconButton>
            </View>

            <View style={styles.gap}>
              <PrimaryButton label="Login" loading />
            </View>

            <View style={styles.dividerWrap}>
              <Divider label="Or" />
            </View>

            <SocialButton label="Login With Apple" icon={<AppleIcon />} />
            <View style={styles.gap}>
              <SocialButton label="Login With Google" icon={<GoogleIcon />} />
            </View>

            <Text style={styles.footer}>
              Don't have an account? <Text style={styles.footerLink}>Sign Up</Text>
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  title: { ...typography.title, color: colors.textPrimary, textAlign: 'center' },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  form: { marginTop: spacing.xxl },
  gap: { marginTop: spacing.lg },
  link: { ...typography.link, color: colors.link },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl },
  loginButton: { flex: 1, marginRight: spacing.md },
  dividerWrap: { marginVertical: spacing.xl },
  footer: {
    ...typography.footnote,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
  footerLink: { color: colors.primary, fontWeight: '700' },
});
