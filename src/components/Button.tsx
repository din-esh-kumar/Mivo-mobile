import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { THEME } from '../constants/theme';

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
}) => {
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
      activeOpacity={0.8}
      onPress={onPress}
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
        <>
          {icon}
          <Text style={[styles.baseText, getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: THEME.borderRadius.md,
    gap: 8,
  },
  smBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mdBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  lgBtn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  primaryBtn: {
    backgroundColor: THEME.colors.primary,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryBtn: {
    backgroundColor: THEME.colors.surfaceHover,
  },
  outlineBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
  },
  dangerBtn: {
    backgroundColor: THEME.colors.accentRed,
  },
  ghostBtn: {
    backgroundColor: 'transparent',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  baseText: {
    fontWeight: '600',
    fontSize: 15,
  },
  lightText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: THEME.colors.textPrimary,
  },
  outlineText: {
    color: THEME.colors.textPrimary,
  },
  ghostText: {
    color: THEME.colors.textSecondary,
  },
});
