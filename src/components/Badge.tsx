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
        return { bg: '#064E3B', text: '#34D399', border: '#059669' };
      case 'danger':
        return { bg: '#7F1D1D', text: '#F87171', border: '#DC2626' };
      case 'warning':
        return { bg: '#78350F', text: '#FBBF24', border: '#D97706' };
      case 'cyan':
        return { bg: '#164E63', text: '#22D3EE', border: '#0891B2' };
      case 'neutral':
        return { bg: '#1E293B', text: '#94A3B8', border: '#334155' };
      default:
        return { bg: '#312E81', text: '#818CF8', border: '#4F46E5' };
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
          paddingHorizontal: size === 'sm' ? 6 : 10,
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
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

