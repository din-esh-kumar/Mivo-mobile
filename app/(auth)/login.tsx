import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../src/constants/theme';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { Mail, Lock, Radio, Server, Sparkles } from 'lucide-react-native';
import { triggerHaptic } from '../../src/utils/haptics';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginAsGuest, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    triggerHaptic();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setError(null);
    const result = await login(email.trim().toLowerCase(), password);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      setError(result.error || 'Invalid email or password');
    }
  };

  const handleGuestDemo = async () => {
    triggerHaptic();
    setError(null);

    // 1. Try dynamic guest creation directly via /auth/guest
    const guestRes = await loginAsGuest('Demo User');
    if (guestRes.success) {
      router.replace('/(tabs)');
      return;
    }

    // 2. Fallback to pre-seeded demo account
    setEmail('alex@mivo.app');
    setPassword('Password123!');
    const seedRes = await login('alex@mivo.app', 'Password123!');
    if (seedRes.success) {
      router.replace('/(tabs)');
    } else {
      setError(guestRes.error || seedRes.error || 'Failed to create demo session');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Server Config Icon */}
          <TouchableOpacity
            testID="server-endpoint-btn"
            style={styles.serverBtn}
            onPress={() => {
              triggerHaptic();
              router.push('/settings/server');
            }}
            activeOpacity={0.8}
          >
            <Server size={14} color="#94A3B8" />
            <Text style={styles.serverBtnText}>Server Endpoint</Text>
          </TouchableOpacity>

          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <View style={styles.iconGlow} />
              <Radio size={34} color={THEME.colors.primary} />
            </View>
            <Text style={styles.title}>Welcome to Mivo</Text>
            <Text style={styles.subtitle}>
              Log in to join your unified rooms, channels, and team conversations.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            )}

            <Input
              testID="login-email-input"
              label="Email Address"
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              leftIcon={<Mail size={18} color="#64748B" />}
            />

            <Input
              testID="login-password-input"
              label="Password"
              placeholder="••••••••"
              isPassword
              value={password}
              onChangeText={setPassword}
              leftIcon={<Lock size={18} color="#64748B" />}
            />

            <Button
              testID="sign-in-btn"
              title="Sign In"
              onPress={handleLogin}
              isLoading={isLoading}
              size="lg"
              style={styles.loginBtn}
            />

            <Button
              testID="demo-user-btn"
              title="Explore as Demo User"
              onPress={handleGuestDemo}
              variant="outline"
              size="md"
              icon={<Sparkles size={16} color={THEME.colors.primaryLight} />}
              style={styles.demoBtn}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity
              testID="create-account-link"
              onPress={() => {
                triggerHaptic();
                router.push('/(auth)/register');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLink}> Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080B11',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  serverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#101625',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.full,
    gap: 6,
    borderWidth: 1,
    borderColor: '#1D273B',
    marginBottom: 20,
  },
  serverBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.35)',
    position: 'relative',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  iconGlow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  form: {
    width: '100%',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderWidth: 1,
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#FCA5A5',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  loginBtn: {
    marginTop: 8,
  },
  demoBtn: {
    marginTop: 12,
    borderColor: '#243048',
    backgroundColor: '#0F1626',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  registerLink: {
    color: THEME.colors.primaryLight,
    fontSize: 14,
    fontWeight: '700',
  },
});
