import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../src/constants/theme';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { Avatar } from '../../src/components/Avatar';
import { UserStatus } from '../../src/types';
import {
  Server,
  LogOut,
  Bell,
  Volume2,
  Shield,
  Smartphone,
  ChevronRight,
  Circle,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateStatus } = useAuthStore();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  const statuses: Array<{ status: UserStatus; label: string; color: string }> = [
    { status: 'ONLINE', label: 'Online', color: THEME.colors.statusOnline },
    { status: 'IDLE', label: 'Away / Idle', color: THEME.colors.statusIdle },
    { status: 'DND', label: 'Do Not Disturb', color: THEME.colors.statusDnd },
    { status: 'OFFLINE', label: 'Invisible', color: THEME.colors.statusOffline },
  ];

  const handleStatusChange = (status: UserStatus) => {
    updateStatus(status);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Mivo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Avatar
            url={user?.avatarUrl}
            name={user?.displayName || 'User'}
            size={72}
            status={user?.status || 'ONLINE'}
            showStatus
          />

          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>{user?.displayName || 'Mivo Explorer'}</Text>
            <Text style={styles.username}>@{user?.username || 'mivo_user'}</Text>
            <Text style={styles.email}>{user?.email || 'user@mivo.local'}</Text>
          </View>
        </View>

        {/* Presence Status Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SET STATUS</Text>
          <View style={styles.card}>
            {statuses.map((item) => {
              const isActive = (user?.status || 'ONLINE') === item.status;
              return (
                <TouchableOpacity
                  key={item.status}
                  style={styles.statusRow}
                  onPress={() => handleStatusChange(item.status)}
                >
                  <View style={styles.statusLeft}>
                    <View
                      style={[styles.statusDot, { backgroundColor: item.color }]}
                    />
                    <Text style={styles.statusLabel}>{item.label}</Text>
                  </View>
                  {isActive && <Circle size={10} color={THEME.colors.primary} fill={THEME.colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <View style={styles.card}>
            <View style={styles.preferenceRow}>
              <View style={styles.prefLeft}>
                <Volume2 size={18} color={THEME.colors.textSecondary} />
                <Text style={styles.prefLabel}>Room Sound Effects</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: '#334155', true: THEME.colors.primary }}
              />
            </View>

            <View style={[styles.preferenceRow, styles.borderTop]}>
              <View style={styles.prefLeft}>
                <Smartphone size={18} color={THEME.colors.textSecondary} />
                <Text style={styles.prefLabel}>Haptic Feedback</Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={setHapticsEnabled}
                trackColor={{ false: '#334155', true: THEME.colors.primary }}
              />
            </View>
          </View>
        </View>

        {/* Developer & Network Config */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DEVELOPER & NETWORK</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => router.push('/settings/server')}
            >
              <View style={styles.actionLeft}>
                <Server size={18} color={THEME.colors.primary} />
                <View>
                  <Text style={styles.actionTitle}>Server Endpoints</Text>
                  <Text style={styles.actionSubtitle}>
                    Configure REST API and WebSocket host
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color={THEME.colors.accentRed} />
          <Text style={styles.logoutText}>Sign Out of Mivo</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Mivo Mobile v1.0.0 (Unified Real-Time Engine)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: 20,
    borderRadius: THEME.borderRadius.xl,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 24,
    gap: 16,
  },
  profileInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: THEME.colors.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  email: {
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    overflow: 'hidden',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  prefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prefLabel: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  actionTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  actionSubtitle: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 14,
    gap: 8,
    marginTop: 12,
    marginBottom: 20,
  },
  logoutText: {
    color: THEME.colors.accentRed,
    fontSize: 14,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
});
