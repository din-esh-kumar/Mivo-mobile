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
      <View style={styles.logoContainer}>
        <Radio size={48} color={THEME.colors.primary} />
        <Text style={styles.title}>MIVO</Text>
        <Text style={styles.tagline}>Unified Real-Time Communication</Text>
      </View>
      <ActivityIndicator size="large" color={THEME.colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 4,
    color: '#FFFFFF',
    marginTop: 8,
  },
  tagline: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  spinner: {
    marginTop: 32,
  },
});
