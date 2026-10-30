import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { THEME } from '../constants/theme';
import { triggerHaptic } from '../utils/haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  testID,
}) => {
  const handlePress = () => {
    if (disabled || isLoading) return;
    triggerHaptic();
    onPress();
  };

  const getContainerStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryBtn;
      case 'secondary':
        return styles.secondaryBtn;
      case 'outline':
        return styles.outlineBtn;
      case 'danger':
        return styles.dangerBtn;
      case 'ghost':
        return styles.ghostBtn;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return styles.lightText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'ghost':
        return styles.ghostText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.smBtn;
      case 'lg':
        return styles.lgBtn;
      default:
        return styles.mdBtn;
    }
  };

  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.82}
      onPress={handlePress}
      disabled={disabled || isLoading}
      style={[
        styles.baseBtn,
        getContainerStyle(),
        getSizeStyle(),
        (disabled || isLoading) && styles.disabledBtn,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={[styles.baseText, getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseBtn: {
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 8,
  },
  baseText: {
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  primaryBtn: {
    backgroundColor: THEME.colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  secondaryBtn: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
  },
  outlineBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
  },
  dangerBtn: {
    backgroundColor: THEME.colors.accentRed,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: THEME.colors.accentRed,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  ghostBtn: {
    backgroundColor: 'transparent',
  },
  smBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  mdBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  lgBtn: {
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: THEME.borderRadius.lg,
  },
  lightText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  secondaryText: {
    color: THEME.colors.textPrimary,
    fontSize: 15,
  },
  outlineText: {
    color: THEME.colors.textSecondary,
    fontSize: 15,
  },
  ghostText: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
  },
  disabledBtn: {
    opacity: 0.45,
  },
});
