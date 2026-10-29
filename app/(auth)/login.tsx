import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../src/constants/theme';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { Mail, Lock, Radio, Server } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setError(null);
    const result = await login(email.trim(), password);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      setError(result.error || 'Invalid email or password');
    }
  };

  const handleGuestDemo = async () => {
    // Quick fill for testing
    setEmail('alex@mivo.local');
    setPassword('Password123!');
    const result = await login('alex@mivo.local', 'Password123!');
    if (result.success) {
      router.replace('/(tabs)');
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
            style={styles.serverBtn}
            onPress={() => router.push('/settings/server')}
          >
            <Server size={18} color={THEME.colors.textSecondary} />
            <Text style={styles.serverBtnText}>Server Endpoint</Text>
          </TouchableOpacity>

          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Radio size={36} color={THEME.colors.primary} />
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
              label="Email Address"
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              leftIcon={<Mail size={18} color={THEME.colors.textMuted} />}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              isPassword
              value={password}
              onChangeText={setPassword}
              leftIcon={<Lock size={18} color={THEME.colors.textMuted} />}
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              isLoading={isLoading}
              size="lg"
              style={styles.loginBtn}
            />

            <Button
              title="Explore as Demo User"
              onPress={handleGuestDemo}
              variant="outline"
              size="md"
              style={styles.demoBtn}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
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
    backgroundColor: THEME.colors.background,
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
    backgroundColor: THEME.colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.full,
    gap: 6,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 16,
  },
  serverBtnText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  form: {
    width: '100%',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: THEME.colors.accentRed,
    borderWidth: 1,
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#FCA5A5',
    fontSize: 13,
    textAlign: 'center',
  },
  loginBtn: {
    marginTop: 8,
  },
  demoBtn: {
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
  },
  registerLink: {
    color: THEME.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
