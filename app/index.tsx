import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/useAuthStore';
import { THEME } from '../src/constants/theme';
import { Radio } from 'lucide-react-native';

export default function IndexScreen() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;

    if (user) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isInitialized, user]);

  return (
    <View style={styles.container}>
      <View style={styles.glowAura} />
      <View style={styles.logoContainer}>
        <View style={styles.logoBubble}>
          <Radio size={44} color={THEME.colors.primary} />
        </View>
        <Text style={styles.title}>MIVO</Text>
        <Text style={styles.tagline}>Unified Real-Time Communication</Text>
        <Text style={styles.subTagline}>Studio Audio • Video Stages • Team Chat</Text>
      </View>
      <ActivityIndicator size="small" color={THEME.colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B11',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowAura: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  logoContainer: {
    alignItems: 'center',
    gap: 6,
  },
  logoBubble: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 6,
    color: '#FFFFFF',
  },
  tagline: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  subTagline: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  spinner: {
    marginTop: 36,
  },
});
