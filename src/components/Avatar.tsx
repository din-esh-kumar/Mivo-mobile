import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';
import { UserStatus } from '../types';

interface AvatarProps {
  url?: string | null;
  name?: string;
  size?: number;
  status?: UserStatus;
  showStatus?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  url,
  name = 'User',
  size = 40,
  status,
  showStatus = false,
}) => {
  const initials = (name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  const getStatusColor = () => {
    switch (status) {
      case 'ONLINE':
        return THEME.colors.statusOnline;
      case 'IDLE':
        return THEME.colors.statusIdle;
      case 'DND':
        return THEME.colors.statusDnd;
      default:
        return THEME.colors.statusOffline;
    }
  };

  const statusSize = Math.max(10, Math.floor(size * 0.28));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {url ? (
        <Image source={{ uri: url }} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} />
      ) : (
        <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
        </View>
      )}

      {showStatus && status && (
        <View
          style={[
            styles.statusBadge,
            {
              width: statusSize,
              height: statusSize,
              borderRadius: statusSize / 2,
              backgroundColor: getStatusColor(),
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    backgroundColor: '#312E81',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4338CA',
  },
  initials: {
    color: '#E0E7FF',
    fontWeight: '700',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: THEME.colors.background,
  },
});

