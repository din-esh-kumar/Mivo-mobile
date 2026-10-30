import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';

interface BadgeProps {
  label: string | number;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral' | 'cyan';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  style,
}) => {
  const getBadgeColors = () => {
    switch (variant) {
      case 'success':
        return { bg: 'rgba(16, 185, 129, 0.16)', text: '#34D399', border: 'rgba(16, 185, 129, 0.35)' };
      case 'danger':
        return { bg: 'rgba(239, 68, 68, 0.16)', text: '#F87171', border: 'rgba(239, 68, 68, 0.35)' };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.16)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.35)' };
      case 'cyan':
        return { bg: 'rgba(6, 182, 212, 0.16)', text: '#22D3EE', border: 'rgba(6, 182, 212, 0.35)' };
      case 'neutral':
        return { bg: 'rgba(148, 163, 184, 0.12)', text: '#CBD5E1', border: 'rgba(148, 163, 184, 0.25)' };
      default:
        return { bg: 'rgba(99, 102, 241, 0.16)', text: '#A5B4FC', border: 'rgba(99, 102, 241, 0.35)' };
    }
  };

  const colors = getBadgeColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingVertical: size === 'sm' ? 2 : 4,
          paddingHorizontal: size === 'sm' ? 7 : 10,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: colors.text,
            fontSize: size === 'sm' ? 10 : 12,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
