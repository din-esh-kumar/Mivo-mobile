import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../../src/constants/theme';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { Avatar } from '../../src/components/Avatar';
import { UserStatus } from '../../src/types';
import { STORAGE_KEYS } from '../../src/api/api-client';
import { showCrossPlatformAlert } from '../../src/utils/dialog';
import {
  Server,
  LogOut,
  Volume2,
  Smartphone,
  ChevronRight,
  Circle,
  ShieldCheck,
  Headphones,
  Sliders,
} from 'lucide-react-native';
import { triggerHaptic } from '../../src/utils/haptics';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateStatus } = useAuthStore();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.SOUND_ENABLED).then((val) => {
      if (val !== null) setSoundEnabled(val === 'true');
    });
    AsyncStorage.getItem(STORAGE_KEYS.HAPTICS_ENABLED).then((val) => {
      if (val !== null) setHapticsEnabled(val === 'true');
    });
  }, []);

  const handleToggleSound = (val: boolean) => {
    triggerHaptic();
    setSoundEnabled(val);
    AsyncStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(val)).catch(() => {});
  };

  const handleToggleHaptics = (val: boolean) => {
    triggerHaptic();
    setHapticsEnabled(val);
    AsyncStorage.setItem(STORAGE_KEYS.HAPTICS_ENABLED, String(val)).catch(() => {});
  };

  const statuses: Array<{ status: UserStatus; label: string; color: string; desc: string }> = [
    { status: 'ONLINE', label: 'Online', color: THEME.colors.statusOnline, desc: 'Available for calls & stages' },
    { status: 'IDLE', label: 'Away / Idle', color: THEME.colors.statusIdle, desc: 'Stepped away temporarily' },
    { status: 'DND', label: 'Do Not Disturb', color: THEME.colors.statusDnd, desc: 'Mute incoming call alerts' },
    { status: 'OFFLINE', label: 'Invisible', color: THEME.colors.statusOffline, desc: 'Appear offline to team' },
  ];

  const handleStatusChange = (status: UserStatus) => {
    triggerHaptic();
    updateStatus(status);
  };

  const handleLogout = () => {
    triggerHaptic();
    showCrossPlatformAlert('Sign Out', 'Are you sure you want to sign out of Mivo?', [
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Avatar
              url={user?.avatarUrl}
              name={user?.displayName || 'User'}
              size={68}
              status={user?.status || 'ONLINE'}
              showStatus
            />
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.displayName}>{user?.displayName || 'Mivo Explorer'}</Text>
              <View style={styles.badgePro}>
                <ShieldCheck size={11} color="#818CF8" />
                <Text style={styles.badgeProText}>PRO</Text>
              </View>
            </View>
            <Text style={styles.username}>@{user?.username || 'mivo_user'}</Text>
            <Text style={styles.email}>{user?.email || 'user@mivo.local'}</Text>
          </View>
        </View>

        {/* Presence Status Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SET STATUS</Text>
          <View style={styles.card}>
            {statuses.map((item, idx) => {
              const isActive = (user?.status || 'ONLINE') === item.status;
              return (
                <TouchableOpacity
                  key={item.status}
                  testID={`status-${item.status}`}
                  style={[styles.statusRow, idx > 0 && styles.borderTop]}
                  onPress={() => handleStatusChange(item.status)}
                  activeOpacity={0.75}
                >
                  <View style={styles.statusLeft}>
                    <View style={[styles.statusDot, { backgroundColor: item.color }]} />
                    <View>
                      <Text style={styles.statusLabel}>{item.label}</Text>
                      <Text style={styles.statusDesc}>{item.desc}</Text>
                    </View>
                  </View>
                  {isActive && (
                    <Circle size={10} color={THEME.colors.primary} fill={THEME.colors.primary} />
                  )}
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
                <View style={styles.prefIconBg}>
                  <Volume2 size={16} color="#818CF8" />
                </View>
                <View>
                  <Text style={styles.prefLabel}>Room Sound Effects</Text>
                  <Text style={styles.prefDesc}>Chimes when members join or speak</Text>
                </View>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={handleToggleSound}
                trackColor={{ false: '#334155', true: THEME.colors.primary }}
              />
            </View>

            <View style={[styles.preferenceRow, styles.borderTop]}>
              <View style={styles.prefLeft}>
                <View style={styles.prefIconBg}>
                  <Smartphone size={16} color="#10B981" />
                </View>
                <View>
                  <Text style={styles.prefLabel}>Haptic Feedback</Text>
                  <Text style={styles.prefDesc}>Tactile vibrations on press & mic tap</Text>
                </View>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={handleToggleHaptics}
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
              testID="profile-server-settings-btn"
              style={styles.actionRow}
              onPress={() => {
                triggerHaptic();
                router.push('/settings/server');
              }}
              activeOpacity={0.75}
            >
              <View style={styles.actionLeft}>
                <View style={styles.serverIconBg}>
                  <Server size={16} color={THEME.colors.primary} />
                </View>
                <View>
                  <Text style={styles.actionTitle}>Server Endpoints</Text>
                  <Text style={styles.actionSubtitle}>
                    Configure REST API and WebSocket host
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color="#475569" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          testID="logout-btn"
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={16} color={THEME.colors.accentRed} />
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
    backgroundColor: '#080B11',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101625',
    padding: 18,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#1D273B',
    marginBottom: 20,
    gap: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  avatarWrap: {
    padding: 2,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  displayName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  badgePro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(99, 102, 241, 0.16)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  badgeProText: {
    color: '#818CF8',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  username: {
    fontSize: 13,
    color: THEME.colors.primaryLight,
    fontWeight: '500',
    marginBottom: 2,
  },
  email: {
    fontSize: 12,
    color: '#64748B',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#101625',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: '#1D273B',
    overflow: 'hidden',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  statusLabel: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  statusDesc: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
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
    borderTopColor: '#1A2338',
  },
  prefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  prefIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#162035',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefLabel: {
    color: '#F8FAFC',
    fontSize: 13.5,
    fontWeight: '600',
  },
  prefDesc: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  serverIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  actionSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 13,
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  logoutText: {
    color: THEME.colors.accentRed,
    fontSize: 14,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11.5,
    color: '#475569',
  },
});
