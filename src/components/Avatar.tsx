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

// Curated designer gradients for initials fallback based on name hash
const AVATAR_PALETTES = [
  { bg: '#312E81', border: '#4338CA', text: '#E0E7FF' }, // Indigo
  { bg: '#064E3B', border: '#059669', text: '#D1FAE5' }, // Emerald
  { bg: '#581C87', border: '#7C3AED', text: '#F3E8FF' }, // Purple
  { bg: '#164E63', border: '#0891B2', text: '#CFFAFE' }, // Cyan
  { bg: '#701A75', border: '#A21CAF', text: '#FDF4FF' }, // Fuchsia
  { bg: '#78350F', border: '#D97706', text: '#FEF3C7' }, // Amber
  { bg: '#1E293B', border: '#334155', text: '#F8FAFC' }, // Slate
];

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

  // Deterministic palette pick
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = (name.charCodeAt(i) + ((hash << 5) - hash)) | 0;
  }
  const paletteIndex = Math.abs(hash) % AVATAR_PALETTES.length;
  const palette = AVATAR_PALETTES[paletteIndex];

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
        <Image
          source={{ uri: url }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: palette.bg,
              borderColor: palette.border,
            },
          ]}
        >
          <Text
            style={[
              styles.initials,
              {
                fontSize: Math.max(10, Math.floor(size * 0.38)),
                color: palette.text,
              },
            ]}
          >
            {initials}
          </Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
  },
  initials: {
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  statusBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    borderWidth: 2,
    borderColor: '#080B11',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 3,
  },
});
